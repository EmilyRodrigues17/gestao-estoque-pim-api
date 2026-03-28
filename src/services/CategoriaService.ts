import { appDataSource } from "../database/appDataSource.js";
import { Categoria } from "../entities/Categoria.js";
import { AppError } from "../errors/AppError.js";

export default class CategoriaService {
    private categoriaRepository = appDataSource.getRepository(Categoria);

    public async findAll(): Promise<Categoria[]> {
        return this.categoriaRepository.find()
    };

    public async getById(id: string): Promise<Categoria> {
        const categoriaExiste = await this.categoriaRepository.findOne({ 
            where: { id: id } 
        });

        if (!categoriaExiste) {
            throw new AppError(404, "Categoria não encontrada.")
        }

        return categoriaExiste
    }

    public async create(data: Categoria): Promise<Categoria> {
        const categoriaExiste = await this.categoriaRepository.findOne({
            where: {nome: data.nome}
        });

        if (categoriaExiste){
            throw new AppError(400, "Categoria já cadastrada.")
        }

        const novaCategoria = this.categoriaRepository.create(data);
        await this.categoriaRepository.save(novaCategoria);

        return novaCategoria;
    };

    public async update(id: string, data: Partial<Categoria>): Promise<Categoria> {
        const categoriaExiste = await this.getById(id);

        if (data.nome && data.nome !== categoriaExiste.nome) {
            const categoriaComMesmoNome = await this.categoriaRepository.findOne({
                where: { nome: data.nome }
            });

            if (categoriaComMesmoNome) {
                throw new AppError(400, "Já existe uma categoria com esse nome.");
            }
        }

        const categoriaAtualizada = this.categoriaRepository.merge(categoriaExiste, data);
        await this.categoriaRepository.save(categoriaAtualizada);

        return categoriaAtualizada;
    };

    public async delete(id: string): Promise<void> {
        const categoriaExiste = await this.getById(id);

        await this.categoriaRepository.remove(categoriaExiste);
    };
};
