-- Invented data for the integration test. Run as the owner of Logbook's
-- database, after every migration.
INSERT INTO core.item (state, title, address, recorded_at) VALUES
    ('recorded', 'Sample wrap rate', 'https://tools.example/wrap-rate', '2026-01-05 09:00+00'),
    ('discovered', 'Sample item with a quiet history', NULL, '2026-01-06 09:00+00');

INSERT INTO core.ledger (item_id, actor, from_state, to_state, error_code, note, recorded_at) VALUES
    ('PA-0001', 'trawl',   NULL,         'discovered', NULL,        NULL,                       '2026-01-05 09:00+00'),
    ('PA-0001', 'trawl',   'discovered', 'recorded',   NULL,        'Recorded from the sample source.', '2026-01-05 09:05+00'),
    ('PA-0001', 'sextant', 'recorded',   'recorded',   'E_TIMEOUT', NULL,                       '2026-01-05 09:10+00'),
    ('PA-0002', 'trawl',   NULL,         'discovered', NULL,        NULL,                       '2026-01-06 09:00+00');
