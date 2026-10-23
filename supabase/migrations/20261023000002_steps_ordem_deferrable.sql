-- Permite reordenar etapas num único upsert (a checagem de ordem única fica para o fim da transação)
alter table steps drop constraint steps_course_id_ordem_key;
alter table steps add constraint steps_course_id_ordem_key unique (course_id, ordem) deferrable initially deferred;
