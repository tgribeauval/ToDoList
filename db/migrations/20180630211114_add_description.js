
exports.up = function(knex, Promise) {
  return knex.schema.table('todo', function(table){
    table.string('description');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
