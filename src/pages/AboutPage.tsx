import { de } from "../i18n/de";

export default function AboutPage() {
  return (
    <div className="page-stack about-page">
      <section>
        <h2>Über</h2>
        <p>Ich liebe die Checkerwelt. Meine Kinder auch.</p>
        <p>
          Der Checker Guide ist entstanden, weil sie sich oft nicht entscheiden können, welche Folge
          sie als Nächstes schauen möchten.
        </p>
        <p>
          Deshalb habe ich diesen kleinen, inoffiziellen Guide gebaut. Hier können wir eine tägliche
          Empfehlung ansehen, am Glücksrad drehen oder durch die vollständigen Checker-Folgen
          stöbern.
        </p>
        <p>
          Alle Folgen öffnen sich direkt auf YouTube. Der Checker Guide ist ein privates Fanprojekt
          und nicht offiziell.
        </p>
        <p>
          Mit Liebe gemacht, weil Checker Tobi und die Checkerwelt bei uns zu Hause einfach
          großartig sind.
        </p>
      </section>
      <section className="notice-band">
        <h2>Hinweis</h2>
        <p>{de.unofficialNotice}</p>
      </section>
    </div>
  );
}
