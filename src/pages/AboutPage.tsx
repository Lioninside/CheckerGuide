import { de } from "../i18n/de";

export default function AboutPage() {
  return (
    <div className="page-stack about-page">
      <section>
        <h2>{de.about.title}</h2>
        {de.about.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>
      <section className="notice-band">
        <h2>{de.about.noticeTitle}</h2>
        <p>{de.unofficialNotice}</p>
      </section>
    </div>
  );
}
