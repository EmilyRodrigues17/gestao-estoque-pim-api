import { appDataSource } from "../database/appDataSource.js";
import type { CreateCategoriaSchemaDTO, UpdateCategoriaSchemaDTO } from "../dto/categoriaSchemaDTO.js";
import { Categoria } from "../entities/Categoria.js";
import { Insumo } from "../entities/Insumo.js";
import { AppError } from "../errors/AppError.js";

export default class CategoriaService {
    private categoriaRepository = appDataSource.getRepository(Categoria);
    private insumoRepository = appDataSource.getRepository(Insumo);

    public async findAll(): Promise<any[]> {
        const categorias = await this.categoriaRepository.find({
            relations: ['insumos'],
            order: { nome: 'ASC' },
        });

        return categorias.map(cat => ({
            id: cat.id,
            nome: cat.nome,
            descricao: cat.descricao,
            created_at: cat.created_at,
            updated_at: cat.updated_at,
            insumosVinculados: cat.insumos ? cat.insumos.length : 0,
        }));
    };

    public async getById(id: string): Promise<Categoria> {
        const categoriaExiste = await this.categoriaRepository.findOne({ 
            where: { id: id } 
        });

        if (!categoriaExiste) {
            throw new AppError("Categoria não encontrada.", 404)
        }

        return categoriaExiste
    }

    public async create(data: CreateCategoriaSchemaDTO): Promise<Categoria> {
        const categoriaExiste = await this.categoriaRepository.findOne({
            where: {nome: data.nome}
        });

        if (categoriaExiste){
            throw new AppError("Categoria já cadastrada.", 409)
        }

        const novaCategoria = this.categoriaRepository.create(data);
        await this.categoriaRepository.save(novaCategoria);

        return novaCategoria;
    };

    public async update(id: string, data: UpdateCategoriaSchemaDTO): Promise<Categoria> {
        const categoriaExiste = await this.getById(id);

        if (data.nome && data.nome !== categoriaExiste.nome) {
            const categoriaComMesmoNome = await this.categoriaRepository.findOne({
                where: { nome: data.nome }
            });

            if (categoriaComMesmoNome) {
                throw new AppError("Já existe uma categoria com esse nome.", 409);
            }
        }

        const dadosUpdate = Object.fromEntries(
            Object.entries(data).filter(([,value]) => value !== undefined)
        ) as Partial<Categoria>

        const categoriaAtualizada = this.categoriaRepository.merge(categoriaExiste, dadosUpdate);
        await this.categoriaRepository.save(categoriaAtualizada);

        return categoriaAtualizada;
    };

    public async delete(id: string): Promise<void> {
        const categoriaExiste = await this.getById(id);

        const insumosCountPorCategoria = await this.insumoRepository.count({
            where: { categoria_id: categoriaExiste.id }
        });

        if (insumosCountPorCategoria > 0){
            throw new AppError(
                `Esta categoria possui ${insumosCountPorCategoria} insumo(s) vinculado(s) e não pode ser excluída. Remova ou reatribua os insumos antes de excluir.`,
                409
            )
        }

        await this.categoriaRepository.remove(categoriaExiste);
    };
};
