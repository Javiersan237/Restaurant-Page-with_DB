/**
 * Datos estáticos del menú de ÉLYSÉE.
 *
 * ⚠️ NOTA: Estos datos son estáticos y viven solo en el frontend.
 * Cuando el restaurante necesite actualizar el menú, se edita este archivo.
 * En el futuro, si se requiere dinámico, se migrará a un endpoint del backend.
 */

export const menu = [
  {
    id: 'entradas',
    categoria: 'Entradas',
    descripcion: 'Para comenzar la experiencia',
    platillos: [
      {
        id: 'e1',
        nombre: 'Tartar de Atún Rojo',
        descripcion: 'Atún fresco, aguacate, sésamo y un toque de yuzu',
        precio: 320,
      },
      {
        id: 'e2',
        nombre: 'Sopa de Cebolla Gratinada',
        descripcion: 'Receta tradicional francesa con gruyère fundido',
        precio: 220,
      },
      {
        id: 'e3',
        nombre: 'Foie Gras Mi-Cuit',
        descripcion: 'Foie gras con mermelada de higo y brioche tostado',
        precio: 480,
      },
      {
        id: 'e4',
        nombre: 'Burrata con Tomate Confitado',
        descripcion: 'Burrata cremosa, tomate confitado, albahaca y aceite de oliva',
        precio: 280,
      },
    ],
  },
  {
    id: 'principales',
    categoria: 'Platos Fuertes',
    descripcion: 'El corazón de nuestra cocina',
    platillos: [
      {
        id: 'p1',
        nombre: 'Coq au Vin',
        descripcion: 'Pollo cocido lentamente en vino tinto, champiñones y tocino',
        precio: 520,
      },
      {
        id: 'p2',
        nombre: 'Boeuf Bourguignon',
        descripcion: 'Res estofada en vino tinto con zanahorias y cebollitas',
        precio: 580,
      },
      {
        id: 'p3',
        nombre: 'Salmón a la Mantequilla de Limón',
        descripcion: 'Salmón noruego, mantequilla de limón y espárragos',
        precio: 540,
      },
      {
        id: 'p4',
        nombre: 'Risotto de Trufa Negra',
        descripcion: 'Arroz arborio, trufa negra, parmesano y un toque de mantequilla',
        precio: 620,
      },
      {
        id: 'p5',
        nombre: 'Magret de Pato',
        descripcion: 'Pechuga de pato, salsa de naranja y puré de camote',
        precio: 680,
      },
      {
        id: 'p6',
        nombre: 'Ratatouille Provenzal',
        descripcion: 'Verduras del huerto, hierbas de Provenza y aceite de oliva (vegetariano)',
        precio: 380,
      },
    ],
  },
  {
    id: 'postres',
    categoria: 'Postres',
    descripcion: 'El dulce final',
    platillos: [
      {
        id: 'd1',
        nombre: 'Crème Brûlée',
        descripcion: 'Clásico francés con vainilla de Madagascar',
        precio: 180,
      },
      {
        id: 'd2',
        nombre: 'Tarta Tatin',
        descripcion: 'Manzanas caramelizadas con helado de vainilla',
        precio: 200,
      },
      {
        id: 'd3',
        nombre: 'Mousse de Chocolate Belga',
        descripcion: 'Chocolate 70%, crema chantilly y frambuesas frescas',
        precio: 220,
      },
      {
        id: 'd4',
        nombre: 'Profiteroles',
        descripcion: 'Bollos rellenos de crema, salsa de chocolate caliente',
        precio: 190,
      },
    ],
  },
  {
    id: 'bebidas',
    categoria: 'Bebidas',
    descripcion: 'Vinos, cócteles y más',
    platillos: [
      {
        id: 'b1',
        nombre: 'Vinos Franceses',
        descripcion: 'Selección de Burdeos, Borgoña y Champagne — consulta nuestra carta',
        precio: 0,
        precioTexto: 'Consultar',
      },
      {
        id: 'b2',
        nombre: 'Kir Royal',
        descripcion: 'Champagne con licor de cassis',
        precio: 180,
      },
      {
        id: 'b3',
        nombre: 'French 75',
        descripcion: 'Ginebra, limón, azúcar y Champagne',
        precio: 200,
      },
      {
        id: 'b4',
        nombre: 'Café Gourmet',
        descripcion: 'Espresso, capuchino o café filtrado',
        precio: 80,
      },
      {
        id: 'b5',
        nombre: 'Aguas Frescas de la Casa',
        descripcion: 'Sabores del día — pregunta a tu mesero',
        precio: 60,
      },
    ],
  },
]

export default menu
