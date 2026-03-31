import type { FindOptionsWhere } from "typeorm";
import { appDataSource } from "../database/appDataSource.js";
import { Categoria } from "../entities/Categoria.js";
import { Insumo } from "../entities/Insumo.js";
import { AppError } from "../errors/AppError.js";
import type { CreateInsumoSchemaDTO, UpdateInsumoSchemaDTO } from "../dto/insumoSchemaDTO.js";

export default class InsumoService {
    private insumoRepository = appDataSource.getRepository(Insumo);
    private categoriaRepository = appDataSource.getRepository(Categoria);

    public async findAll(): Promise<Insumo[]> {
        return this.insumoRepository.find({ 
            relations: { categoria: true }
        })
    };

    public async getById(id: string): Promise<Insumo> {
        const insumoExiste = await this.insumoRepository.findOne({
            where: { id: id },
            relations: { categoria: true }
        });

        if (!insumoExiste) {
            throw new AppError("Insumo não encontrado.", 404)
        }

        return insumoExiste
    };

    
    public async getInsumosByParam(filtros: FindOptionsWhere<Insumo>): Promise<Insumo[]> {
        const insumoExiste = this.insumoRepository.find({
            where: filtros,
            relations: { categoria: true }
        });

        if ((await insumoExiste).length == 0) {
            throw new AppError("Insumo não encontrado.", 404)
        }

        return insumoExiste
    };


    public async create(data: CreateInsumoSchemaDTO): Promise<Insumo> {
        const insumoExiste = await this.insumoRepository.findOne({
            where: [
                {nome: data.nome},
                {codigo: data.codigo}
            ]
        });

        if (insumoExiste){
            throw new AppError("Insumo já cadastrado.", 409)
        };

        const categoria = await this.categoriaRepository.findOne({
            where: { id: data.categoria_id }
        });

        if (!categoria) {
            throw new AppError("Categoria não encontrada.", 404)
        }

        const novoInsumo = this.insumoRepository.create(data);
        await this.insumoRepository.save(novoInsumo);

        return novoInsumo;
    };

    public async update(id: string, data: UpdateInsumoSchemaDTO): Promise<Insumo> {
        const insumoExiste = await this.getById(id);
        if (data.codigo && data.codigo !== insumoExiste.codigo){
            const insumoComMesmoCodigo = await this.insumoRepository.findOne({
                where: { codigo: data.codigo }
            });

            if (insumoComMesmoCodigo) {
                throw new AppError("Já existe um insumo com esse código", 409)
            }
        }

        if (data.nome && data.nome !== insumoExiste.nome){
            const insumoComMesmoNome = await this.insumoRepository.findOne({
                where: { nome: data.nome }
            });

            if (insumoComMesmoNome) {
                throw new AppError("Já existe um insumo com esse nome", 409)
            }
        }

        const dadosUpdate = Object.fromEntries(
            Object.entries(data).filter(([,value]) => value !== undefined)
        ) as Partial<Insumo>

        const insumoAtualizado = this.insumoRepository.merge(insumoExiste, dadosUpdate);
        await this.insumoRepository.save(insumoAtualizado);

        return insumoAtualizado;
    };

    public async delete(id: string): Promise<void> {
        const insumoExiste = await this.getById(id);

        insumoExiste.ativo = false

        await this.insumoRepository.save(insumoExiste);
    }

}