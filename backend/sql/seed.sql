INSERT INTO users (u_id, u_username, u_email, u_password_hash, u_created_at) VALUES
  (1, 'upcyclehub', 'info@upcyclehub.local', 'seed-password-hash', '2026-04-28 10:00:00');

INSERT INTO categories (c_id, c_name) VALUES
  (1, 'Wohnen'),
  (2, 'Organisation'),
  (3, 'Garten'),
  (4, 'Textil');

INSERT INTO difficulties (d_id, d_name) VALUES
  (1, 'leicht'),
  (2, 'mittel'),
  (3, 'anspruchsvoll');

INSERT INTO materials (m_id, m_name) VALUES
  (1, 'Konservendose'),
  (2, 'Marmeladenglas'),
  (3, 'Holzkiste'),
  (4, 'altes T-Shirt'),
  (5, 'Glasflasche'),
  (6, 'Stoffreste'),
  (7, 'Karton'),
  (8, 'Juteschnur'),
  (9, 'Holzleiste'),
  (10, 'Pappe');

INSERT INTO projects (
  p_id,
  p_u_id,
  p_c_id,
  p_d_id,
  p_title,
  p_slug,
  p_summary,
  p_description,
  p_estimated_minutes,
  p_image_url,
  p_created_at,
  p_updated_at
) VALUES
  (
    1,
    1,
    3,
    1,
    'Kräutertopf aus Konservendose',
    'kraeutertopf-aus-konservendose',
    'Eine gereinigte Konservendose wird zu einem kleinen Topf für Küchenkräuter.',
    'Aus einer leeren Konservendose entsteht mit wenigen Handgriffen ein einfacher Kräutertopf. Das Projekt eignet sich gut für Fensterbank oder Balkon und zeigt, wie Verpackungen sinnvoll weiterverwendet werden können.',
    30,
    NULL,
    '2026-04-28 10:10:00',
    '2026-04-28 10:10:00'
  ),
  (
    2,
    1,
    2,
    1,
    'Stiftehalter aus Marmeladenglas',
    'stiftehalter-aus-marmeladenglas',
    'Ein gebrauchtes Glas wird zu einem schlichten Stiftehalter für den Schreibtisch.',
    'Ein leeres Marmeladenglas lässt sich schnell reinigen und als Stiftehalter nutzen. Mit etwas Schnur oder Stoff wirkt es ordentlicher und passt gut auf den Arbeitsplatz.',
    20,
    NULL,
    '2026-04-28 10:15:00',
    '2026-04-28 10:15:00'
  ),
  (
    3,
    1,
    1,
    2,
    'Wandregal aus Holzkiste',
    'wandregal-aus-holzkiste',
    'Eine alte Holzkiste wird zu einem einfachen Regal für kleine Gegenstände.',
    'Eine gebrauchte Holzkiste kann gereinigt, abgeschliffen und als kleines Wandregal eingesetzt werden. Das Projekt verbindet Wiederverwendung mit praktischer Ordnung im Wohnbereich.',
    75,
    NULL,
    '2026-04-28 10:20:00',
    '2026-04-28 10:20:00'
  ),
  (
    4,
    1,
    4,
    2,
    'Einkaufstasche aus T-Shirt',
    'einkaufstasche-aus-t-shirt',
    'Aus einem alten T-Shirt entsteht eine wiederverwendbare Einkaufstasche.',
    'Ein aussortiertes T-Shirt kann zu einer einfachen Tasche umfunktioniert werden. Dadurch bekommt ein altes Kleidungsstück eine neue Aufgabe und Plastiktaschen werden vermieden.',
    45,
    NULL,
    '2026-04-28 10:25:00',
    '2026-04-28 10:25:00'
  ),
  (
    5,
    1,
    1,
    2,
    'Kerzenhalter aus Glasflasche',
    'kerzenhalter-aus-glasflasche',
    'Eine leere Glasflasche wird zu einem ruhigen Kerzenhalter für den Tisch.',
    'Eine schöne Glasflasche kann als schlichter Kerzenhalter weiterverwendet werden. Das Projekt funktioniert besonders gut mit stabilen Flaschen und einer passenden Kerze.',
    35,
    NULL,
    '2026-04-28 10:30:00',
    '2026-04-28 10:30:00'
  ),
  (
    6,
    1,
    2,
    1,
    'Schreibtischbox aus Karton',
    'schreibtischbox-aus-karton',
    'Stabiler Karton wird zu einer kleinen Box für Notizen und Zubehör.',
    'Aus Karton und Pappe entsteht eine einfache Box für den Schreibtisch. Sie hilft beim Sortieren kleiner Dinge und nutzt Material, das sonst oft direkt entsorgt wird.',
    40,
    NULL,
    '2026-04-28 10:35:00',
    '2026-04-28 10:35:00'
  );

INSERT INTO project_materials (pm_p_id, pm_m_id) VALUES
  (1, 1),
  (1, 8),
  (2, 2),
  (2, 6),
  (2, 8),
  (3, 3),
  (3, 9),
  (4, 4),
  (5, 5),
  (5, 8),
  (6, 7),
  (6, 10);

INSERT INTO project_steps (ps_p_id, ps_step_number, ps_text) VALUES
  (1, 1, 'Dose gründlich auswaschen und scharfe Kanten entfernen.'),
  (1, 2, 'Außenfläche nach Wunsch mit Juteschnur oder Stoff gestalten.'),
  (1, 3, 'Erde einfüllen und Kräuter einsetzen.'),
  (2, 1, 'Glas reinigen und Etikettenreste entfernen.'),
  (2, 2, 'Stoffreste oder Schnur am Glas befestigen.'),
  (2, 3, 'Stifte und kleine Schreibwaren einsortieren.'),
  (3, 1, 'Holzkiste reinigen und grobe Stellen abschleifen.'),
  (3, 2, 'Kiste stabil an der Wand befestigen.'),
  (3, 3, 'Kleine Gegenstände oder Deko ordentlich einräumen.'),
  (4, 1, 'T-Shirt flach hinlegen und Ärmel entfernen.'),
  (4, 2, 'Unterkante einschneiden und die Streifen verknoten.'),
  (4, 3, 'Tasche wenden und auf Stabilität prüfen.'),
  (5, 1, 'Flasche reinigen und vollständig trocknen lassen.'),
  (5, 2, 'Flaschenhals auf passende Kerzengröße prüfen.'),
  (5, 3, 'Kerze einsetzen und sicheren Stand kontrollieren.'),
  (6, 1, 'Karton auf die gewünschte Größe zuschneiden.'),
  (6, 2, 'Seitenteile falten und mit Pappe verstärken.'),
  (6, 3, 'Box zusammenkleben und nach dem Trocknen befüllen.');
