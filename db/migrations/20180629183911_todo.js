
exports.up = function(knex, Promise) {
  return knex.schema.createTable('todo', function (table) {
    table.increments();
    table.integer('user_id');
    table.foreign('user_id').references('id').inTable('users');
    table.string('category');
    table.string('content')
  });

};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('todo');
  };




