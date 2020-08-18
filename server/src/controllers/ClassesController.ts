import {Request, Response} from 'express';

import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHourToMinutes';

interface ScheduleItem {
    week_day: number;
    from: string;
    to: string;
}


export default class ClassesController {
    async index( request: Request, response: Response) {
        const filters = request.query;

        const subject = filters.subject as string;
        const week_day = filters.week_day as string;
        const time = filters.time as string;
        
        if(!filters.week_day || !filters.subject || !filters.time) {
            return response.status(400).json({
                error: 'Missing filters to search classes'
            })
        }
        
        const timeInMinutes = convertHourToMinutes(time);
        
        const classes = await db('classes')
            .whereExists(function(){
                this.select('class_schedule.*')
                    .from('class_schedule')
                    .whereRaw('`class_schedule`.`class_id` = `classes`.`id`') // Aqui o codigo serve para mostrar apenas os professores que estão cadastrados ( que pessuem um ID)
                    .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)]) //Aqui o codigo serve para mostrar a listagem apenas dos professores que dão aula no dia filtrado
                    .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes]) //Aqui o codigo sevre para mostrar a listagem apenas dos professores que trabalham ou na hora exata que o aluno filtrou, ou antes disso 
                    .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes]) // Aqui o codigo serve para mostrar a listagem apenas dos professores que trabalham antes da hora de serviço para dar aula
                })
            .where('classes.subject', '=', subject)
            .join('users', 'classes.user_id', '=', 'users.id')
            .select(['classes.*', 'users.*']);

        return response.json(classes); 
    
    }

    async create (request: Request, response: Response) {
        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule
        } = request.body;
    
        const trx = await db.transaction();
    
        try {
        //Usando try catch para retornar uma mensagem de erro caso a criaçao das tabelas de errado
        //Inserindo dados na tabela users
        //Nesse caso é usada a variavel insertedUsersIds para obter qual é o id de usuario que será populado na tabelas classes
        const insertedUsersIds = await trx('users').insert({
            name, 
            avatar,
            whatsapp,
            bio,
        });
    
        const user_id = insertedUsersIds[0];
    
        //inserindo dados na tabela classes(aulas)
        const insertedClassesIds = await trx('classes').insert({
            subject,
            cost,
            user_id,
        });
    
        const class_id = insertedClassesIds[0];
    
        const classSchedule = schedule.map((scheduleItem: ScheduleItem ) => {
            return {
                class_id,
                week_day: scheduleItem.week_day,
                from: convertHourToMinutes(scheduleItem.from),
                to: convertHourToMinutes(scheduleItem.to) 
            }; 
        })
    
        await trx('class_schedule').insert(classSchedule);
    
        await trx.commit();
    
        return response.status(201).send();
    
        } catch (err) {
            await trx.rollback();
    
    
            return response.status(400).json({
                error: 'Unexpected error while creating new class'
            })
        }
    }
}