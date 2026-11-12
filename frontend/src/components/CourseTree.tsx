import { Link } from "react-router-dom";
import type { CourseGroup } from "../types";
import styles from "./CourseTree.module.css";

export default function CourseTree({ groups }: { groups: CourseGroup[] }) {
  return (
    <div className={styles.group}>
      {groups.map((group) => (
        <section className={styles.group} key={group.id}>
          <h2 className={styles.groupTitle}>{group.name}</h2>
          <div className={styles.nested}>
            {group.courses.map((course) => (
              <section className={styles.course} key={course.id}>
                <h3 className={styles.courseTitle}>{course.title}</h3>
                <ul className={styles.sessionList}>
                  {course.sessions.map((session) => (
                    <li key={session.id}>
                      <Link className={styles.sessionLink} to={`/sessions/${session.id}`}>
                        <span>{session.title}</span>
                        <span className={styles.sessionMeta}>
                          {session.slide_count} slides
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {group.children.length > 0 && <CourseTree groups={group.children} />}
          </div>
        </section>
      ))}
    </div>
  );
}
