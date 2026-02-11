export interface Material {
    id: string;
    name: string;
    pricePerM2: number; // Selling price
    costPrice?: number; // Cost price (for waste calculation)
    description: string;
    image?: string;
    category: 'PHOTO' | 'FINE_ART' | 'CANVAS';
}

export const INITIAL_MATERIALS: Material[] = [
    {
        id: 'p1',
        name: 'Hahnemühle Photo Rag 308g',
        pricePerM2: 450,
        description: 'Papel 100% algodão, textura suave, o mais popular para Fine Art.',
        category: 'FINE_ART'
    },
    {
        id: 'p2',
        name: 'Hahnemühle Bamboo 290g',
        pricePerM2: 480,
        description: '90% fibras de bambu, ecológico e com tom natural quente.',
        category: 'FINE_ART'
    },
    {
        id: 'ph1',
        name: 'Photo Matte 200g',
        pricePerM2: 250,
        description: 'Papel fosco de alta resolução, ideal para ensaios e mostruários.',
        category: 'PHOTO'
    },
    {
        id: 'ph2',
        name: 'Photo Glossy 240g',
        pricePerM2: 280,
        description: 'Papel com brilho intenso, alta nitidez e contraste.',
        category: 'PHOTO'
    },
    {
        id: 'c1',
        name: 'Canvas Canson PhotoArt Pro',
        pricePerM2: 380,
        description: 'Tela de alta qualidade, resistente a água.',
        category: 'CANVAS'
    }
];
