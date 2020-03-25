const connection = require('../database/connection');


module.exports = {
    //index é o nome padrão utilizado pelo metodo de listagem
    async index(request, response) {
        const {page = 1} = request.query;

        const [count] = await connection('incidents').count();  //.count conta a quantidade de casos registrados

        console.log(count);
        

        //esquema de paginação e listagem de 5 elementos do banco de dados
        const incidents = await connection('incidents')
        .join('ongs', 'ongs.id', '=', 'incidents.ong_id') //quando eu quero relacionar dados de duas tabelas
        .limit(5) //limita a busca para 5 elementos
        .offset((page - 1 ) * 5) //pular a busca em 5 itens
        .select([
            'incidents.*',
            'ongs.name',
            'ongs.email',
            'ongs.whatsapp',
            'ongs.city',
            'ongs.uf'
        ]);

        response.header('X-Total-Count', count['count(*)']);
        
        return response.json(incidents);
    },

    async create(request, response) {
        const { title, description, value } = request.body;
        const ong_id = request.headers.authorization;

        const [id] = await connection('incidents').insert({
            title,
            description,
            value,
            ong_id,
        });

        return response.json({ id });
    },

    async delete(request, response){
        const{id} = request.params;
        const ong_id = request.headers.authorization;

        const incident = await connection('incidents')
            .where('id', id)
            .select('ong_id')
            .first();

        if(incident.ong_id != ong_id){
            return response.status(401).json({ error : 'Operation not permitted.'})
        }

        await connection('incidents').where('id', id).delete();

        return response.status(204).send();
    }
};