import Knex from 'knex';

export async function up(knex: Knex ) {
    //criando a tabela dias e horarios de aulas, usando o knex
    return knex.schema.createTable('class_schedule', table => {
        table.increments('id').primary();

        table.integer('week_day').notNullable();
        table.integer('from').notNullable();
        table.integer('to').notNullable();

        //criando um relacionamento com o knex
        table.integer('class_id')
            .notNullable()
            .references('id')
            .inTable('classes') 
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
    });
}

export async function down(knex: Knex){
    return knex.schema.dropTable('class_schedule');
}