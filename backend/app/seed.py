from sqlalchemy import select

from app.database import SessionLocal
from app.models import Category, Course, LearningSession, Milestone, Project, Slide


def get_or_create(model, defaults: dict, **filters):
    with SessionLocal() as db:
        record = db.scalar(select(model).filter_by(**filters))
        if record is None:
            record = model(**defaults)
            db.add(record)
            db.commit()
            db.refresh(record)
        return record.id


def seed() -> None:
    project_id = get_or_create(
        Project,
        {
            "slug": "desafio-latam",
            "name": "Desafío Latam",
            "description": "Proyecto educativo de demostración.",
        },
        slug="desafio-latam",
    )
    get_or_create(
        Project,
        {
            "slug": "adalid",
            "name": "Adalid",
            "description": "",
        },
        slug="adalid",
    )
    with SessionLocal() as db:
        marketing_course = db.scalar(
            select(Course).where(
                Course.slug.in_(
                    ("marketing-automatizaciones", "panorama-tecnologico")
                )
            )
        )
        if marketing_course is None:
            marketing_course = Course(
                slug="marketing-automatizaciones",
                title="Marketing & automatizaciones",
                description="Curso de demostración.",
                project_id=project_id,
            )
            db.add(marketing_course)
        else:
            marketing_course.slug = "marketing-automatizaciones"
            marketing_course.title = "Marketing & automatizaciones"
            marketing_course.description = "Curso de demostración."
            marketing_course.project_id = project_id
        db.commit()
        db.refresh(marketing_course)
        marketing_course_id = marketing_course.id

    get_or_create(
        Course,
        {
            "slug": "ia-para-marketing",
            "title": "IA para marketing",
            "description": "Curso de demostración.",
            "project_id": project_id,
        },
        slug="ia-para-marketing",
    )

    session_specs = [
        ("sesion-01", "Sesión 1 — NVIDIA y Adobe", 0),
        ("sesion-02", "Sesión 2", 1),
        ("sesion-03", "Sesión 3", 2),
        ("sesion-04", "Sesión 4", 3),
    ]
    session_ids = {
        slug: get_or_create(
            LearningSession,
            {
                "slug": slug,
                "title": title,
                "description": "Sesión demostrativa." if position == 0 else "",
                "position": position,
                "course_id": marketing_course_id,
            },
            slug=slug,
        )
        for slug, title, position in session_specs
    }

    category_specs = [
        ("tecnologia", "Tecnología", None),
        ("semiconductores", "Semiconductores", "tecnologia"),
        ("nvidia", "NVIDIA", "semiconductores"),
        ("economia", "Economía", None),
        ("mercados-financieros", "Mercados financieros", "economia"),
        ("acciones", "Acciones", "mercados-financieros"),
        ("software-creativo", "Software creativo", "tecnologia"),
        ("adobe", "Adobe", "software-creativo"),
        ("ia-generativa", "IA generativa", "tecnologia"),
    ]
    category_ids: dict[str, object] = {}
    for slug, name, parent_slug in category_specs:
        category_ids[slug] = get_or_create(
            Category,
            {
                "slug": slug,
                "name": name,
                "parent_id": category_ids.get(parent_slug) if parent_slug else None,
            },
            slug=slug,
        )

    milestone_specs = [
        {
            "slug": "nvidia-liderazgo-y-mercado",
            "title": "NVIDIA: liderazgo y posibles efectos en el mercado",
            "summary": "Bloque demostrativo sobre liderazgo corporativo y factores a considerar al analizar acciones.",
            "position": 0,
            "category_slugs": ["nvidia", "acciones"],
            "slides": [
                ("Liderazgo ejecutivo", "Contexto sobre el CEO y su rol en la estrategia de la compañía."),
                ("La empresa y su mercado", "Aspectos del sector de semiconductores que conviene contextualizar."),
                ("Factores que pueden influir en la acción", "Variables para analizar; no constituye una predicción de precio."),
                ("Preguntas para discusión", "Qué evidencia y fuentes se necesitarían para evaluar posibles impactos."),
            ],
        },
        {
            "slug": "adobe-conferencia-y-tecnologias",
            "title": "Adobe: conferencia y tecnologías presentadas",
            "summary": "Bloque demostrativo para organizar los highlights de una conferencia de Adobe.",
            "position": 1,
            "category_slugs": ["adobe", "ia-generativa"],
            "slides": [
                ("Novedades de la conferencia", "Resumen pendiente de completar con anuncios y fuentes verificadas."),
                ("Herramientas creativas", "Espacio para describir las capacidades presentadas."),
                ("IA generativa", "Espacio para registrar las tecnologías de IA anunciadas."),
                ("Impacto en los flujos de trabajo", "Preguntas para analizar usos, límites e implicaciones."),
            ],
        },
    ]

    for spec in milestone_specs:
        milestone_id = get_or_create(
            Milestone,
            {
                "slug": spec["slug"],
                "title": spec["title"],
                "summary": spec["summary"],
                "position": spec["position"],
                "session_id": session_ids["sesion-01"],
            },
            slug=spec["slug"],
        )

        with SessionLocal() as db:
            milestone = db.get(Milestone, milestone_id)
            for category_slug in spec["category_slugs"]:
                category = db.get(Category, category_ids[category_slug])
                if category not in milestone.categories:
                    milestone.categories.append(category)
            for position, (title, summary) in enumerate(spec["slides"]):
                slide = db.scalar(
                    select(Slide).where(
                        Slide.milestone_id == milestone_id,
                        Slide.position == position,
                    )
                )
                if slide is None:
                    db.add(
                        Slide(
                            title=title,
                            summary=summary,
                            body="Contenido de demostración. Completar con información y fuentes verificadas antes de usar en clase.",
                            position=position,
                            milestone_id=milestone_id,
                        )
                    )
            db.commit()


if __name__ == "__main__":
    seed()
