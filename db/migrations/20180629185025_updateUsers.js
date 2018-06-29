
exports.up = function(knex, Promise) {

  return knex.schema.table('users', function (table) {
    table.dropColumn('name')
    table.string('email');
    table.string('password');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};



