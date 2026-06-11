-- DEV-ONLY. Enriquece a Furadeira de Impacto 650W com specs extras para validar
-- a ficha técnica (caso "muitas specs"). Idempotente. As definitions vivem em
-- 'ferramentas-eletricas' (categoria que a furadeira herda). Em produção, atributos
-- nascem no dashboard (ADR-0009) — este seed é só para a app de dev.
-- Cada statement é autossuficiente (subquery inline) porque um WITH só vale para o
-- primeiro statement de um batch separado por ';'.

INSERT INTO attribute_definition (id, slug, label, input_type, unit, category_id, sort_order)
SELECT 'attr-' || d.slug, d.slug, d.label, d.input_type::attribute_input_type, d.unit,
       (SELECT id FROM category WHERE slug = 'ferramentas-eletricas'), d.sort_order
FROM (VALUES
  ('torque-max',      'Torque máximo',       'number', 'Nm',  3),
  ('impactos-min',    'Impactos por minuto', 'number', 'ipm', 4),
  ('peso',            'Peso',                'number', 'kg',  5),
  ('nivel-ruido',     'Nível de ruído',      'number', 'dB',  6),
  ('comprimento-cabo','Comprimento do cabo', 'number', 'm',   7)
) AS d(slug, label, input_type, unit, sort_order)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tool_attribute_assignment (tool_id, attribute_id, sort_order)
SELECT (SELECT id FROM tool WHERE slug = 'furadeira-de-impacto-650w'), 'attr-' || d.slug, d.sort_order
FROM (VALUES ('torque-max',3),('impactos-min',4),('peso',5),('nivel-ruido',6),('comprimento-cabo',7)) AS d(slug, sort_order)
ON CONFLICT (tool_id, attribute_id) DO NOTHING;

INSERT INTO tool_attribute_value (tool_id, attribute_id, value_numeric)
SELECT (SELECT id FROM tool WHERE slug = 'furadeira-de-impacto-650w'), 'attr-' || v.slug, v.val
FROM (VALUES ('torque-max',30),('impactos-min',44800),('peso',1.8),('nivel-ruido',92),('comprimento-cabo',2)) AS v(slug, val)
ON CONFLICT (tool_id, attribute_id) DO UPDATE SET value_numeric = EXCLUDED.value_numeric;
