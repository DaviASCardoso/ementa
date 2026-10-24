-- erro registrado a partir de um item do banco de questões: "<índice da questão>/<item>"
alter table mistakes add column if not exists questao text;
