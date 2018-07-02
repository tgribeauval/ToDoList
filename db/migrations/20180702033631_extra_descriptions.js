
exports.up = function(knex, Promise) {
  return knex.schema.table('todo', function(table){
    table.string('description2');
    table.string('description3');
    table.string('description4')
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('todo');
};
