/**
 * IMPORTACIÓN DE 113 ESTUDIANTES REALES DE MATEATLETAS
 * Basado en el PDF "Horarios y estudiantes - Mateatletas® Club STEAM - DB.pdf"
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Mapeo de códigos de grupo del PDF a códigos en la BD
const GRUPO_MAP: Record<string, string> = {
  'B1': 'MATE-B1',
  'B2': 'B2-001', // Usamos el primero por defecto, luego ajustamos por día/horario
  'B3': 'B3-001',
  'B4': 'L4-001', // En el PDF dice B4 pero es L4
  'L1': 'L1-001',
  'L2': 'L2-001',
  'L3': 'L3-001',
  'L4': 'L4-001',
  'Arduino Con Scratch': 'PROG-ARD-LUNES-18:00',
  'Matemáticas + Scratch': 'PROG-MAT-SCR-JUEVES-18:00',
  'Roblox Studio': 'PROG-RBLX-JUEVES-19:30',
  'Programación de videojuegos': 'PROG-VID-VIERNES-19:30',
  'Astronomía': 'DIV-ASTRO-MIERCOLES-14:30',
  'Matemática Financiera': 'DIV-EMPRE-MIERCOLES-18:30',
};

// Función para mapear grupo + día + horario a código exacto
function getGrupoCodigo(grupoBase: string, dia: string, horario: string): string {
  // Casos especiales con día y horario
  if (grupoBase === 'B2') {
    if (dia === 'Martes' && horario === '14:30') return 'B2-001';
    if (dia === 'Martes' && horario === '19:30') return 'B2-002';
    if (dia === 'Miercoles' && horario === '19:30') return 'B2-003';
    if (dia === 'Jueves' && horario === '19:30') return 'B2-004';
    if (dia === 'Viernes' && horario === '18:00') return 'B2-005';
    if (dia === 'Lunes' && horario === '19:00') return 'B2-LUNES-19:00-AYELEN';
  }

  if (grupoBase === 'B3') {
    if (dia === 'Lunes' && horario === '18:00') return 'B3-001';
    if (dia === 'Martes' && horario === '18:00') return 'B3-002';
    if (dia === 'Miercoles' && horario === '18:00') return 'B3-003';
    if (dia === 'Viernes' && horario === '19:30') return 'B3-004';
  }

  if (grupoBase === 'L4') {
    if (dia === 'Miercoles' && horario === '20:00') return 'L4-001';
    if (dia === 'Lunes' && horario === '17:00') return 'L4-LUNES-17:00-ALEXIS';
  }

  if (grupoBase === 'Arduino Con Scratch') {
    if (horario === '18:00') return 'PROG-ARD-LUNES-18:00';
    if (horario === '19:30') return 'PROG-ARD-LUNES-19:30';
  }

  if (grupoBase === 'Astronomía') {
    if (dia === 'Miercoles') return 'DIV-ASTRO-MIERCOLES-14:30';
    if (dia === 'Jueves') return 'DIV-ASTRO-JUEVES-18:00';
  }

  if (grupoBase === 'Matemática Financiera') {
    if (dia === 'Miercoles') return 'DIV-EMPRE-MIERCOLES-18:30';
    if (dia === 'Jueves') return 'DIV-EMPRE-JUEVES-14:30';
  }

  return GRUPO_MAP[grupoBase] || grupoBase;
}

interface EstudianteData {
  nombre: string;
  apellido: string;
  profesor: string;
  dia: string;
  horario: string;
  grupo: string;
  perfil: string;
  tutor: string;
}

// DATOS EXTRAÍDOS DEL PDF
const estudiantes: EstudianteData[] = [
  // GRUPO B1
  { nombre: 'Santiago', apellido: 'Sierra', profesor: 'Gimena Reniero', dia: 'Lunes', horario: '19:30', grupo: 'B1', perfil: 'Base Progresivo', tutor: 'Vanesa Elida Reyes' },
  { nombre: 'Nehuen', apellido: 'Besagonill', profesor: 'Gimena Reniero', dia: 'Lunes', horario: '19:30', grupo: 'B1', perfil: 'Base Progresivo', tutor: 'Gloria Echevarria' },
  { nombre: 'Benjamin', apellido: 'Gonzales', profesor: 'Gimena Reniero', dia: 'Lunes', horario: '19:30', grupo: 'B1', perfil: 'Base Progresivo', tutor: 'Lucia Angelica Morales Diaz' },
  { nombre: 'Bautista', apellido: 'Escobar', profesor: 'Gimena Reniero', dia: 'Lunes', horario: '19:30', grupo: 'B1', perfil: 'Base Progresivo', tutor: 'Adriana Veronica Bou Khair' },
  { nombre: 'Ivana', apellido: 'Gonzalez', profesor: 'Gimena Reniero', dia: 'Lunes', horario: '19:30', grupo: 'B1', perfil: 'Base Progresivo', tutor: 'Carla Vallejos Ari' },
  { nombre: 'Genaro', apellido: "D'Amico", profesor: 'Gimena Reniero', dia: 'Lunes', horario: '19:30', grupo: 'B1', perfil: 'Base Progresivo', tutor: 'Ludmila Criniti' },

  // GRUPO B2 - Martes 14:30
  { nombre: 'Olivia', apellido: 'Anfus Basilone', profesor: 'Gimena Reniero', dia: 'Martes', horario: '14:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Laura Elizabet Basilone' },
  { nombre: 'Mora', apellido: 'Pacheco', profesor: 'Gimena Reniero', dia: 'Martes', horario: '14:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Cluadio Dario Pacheco / Elsa Spena' },
  { nombre: 'Lara', apellido: 'Pacheco', profesor: 'Gimena Reniero', dia: 'Martes', horario: '14:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Cluadio Dario Pacheco / Elsa Spena' },
  { nombre: 'Gael', apellido: 'Somerville', profesor: 'Gimena Reniero', dia: 'Martes', horario: '14:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Adriana Judith Morales' },
  { nombre: 'Manuel', apellido: 'Roldan', profesor: 'Gimena Reniero', dia: 'Martes', horario: '14:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Luciana Jara' },
  { nombre: 'Santiago', apellido: 'Tesone', profesor: 'Gimena Reniero', dia: 'Martes', horario: '14:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Mariano Tessone / Carla Maria Fournier' },

  // GRUPO B2 - Martes 19:30
  { nombre: 'Gael Froilán', apellido: 'Rodriguez', profesor: 'Gimena Reniero', dia: 'Martes', horario: '19:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Maria Laura Arroyo' },
  { nombre: 'Augusto', apellido: 'Marx', profesor: 'Gimena Reniero', dia: 'Martes', horario: '19:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Efigenia An Di Benedetto' },
  { nombre: 'Santiago', apellido: 'Erbojo', profesor: 'Gimena Reniero', dia: 'Martes', horario: '19:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Maria Leonella Gadea' },

  // GRUPO B2 - Miércoles 19:30
  { nombre: 'Selica', apellido: 'Juan Martín', profesor: 'Gimena Reniero', dia: 'Miercoles', horario: '19:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Eugenia Velazquez' },
  { nombre: 'Delfina', apellido: 'Soler', profesor: 'Gimena Reniero', dia: 'Miercoles', horario: '19:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Sabrina Jesica Moschini' },
  { nombre: 'Lian André', apellido: 'Guzman Fuentes', profesor: 'Gimena Reniero', dia: 'Miercoles', horario: '19:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Yenisei del Rocio Fuentes Gutierrez' },
  { nombre: 'Victoria', apellido: 'Smerkin', profesor: 'Gimena Reniero', dia: 'Miercoles', horario: '19:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Melisa Gisela Santilli' },
  { nombre: 'Mateo', apellido: 'Gori', profesor: 'Gimena Reniero', dia: 'Miercoles', horario: '19:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Mauricio German Gori / Carla Fernández' },

  // GRUPO B2 - Jueves 19:30
  { nombre: 'Andre', apellido: 'Santos Garcia', profesor: 'Gimena Reniero', dia: 'Jueves', horario: '19:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Ketty Yamina Garcia Acosta' },
  { nombre: 'Ángel', apellido: 'Mañque', profesor: 'Gimena Reniero', dia: 'Jueves', horario: '19:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Florencia Jesica Ostaszewski' },
  { nombre: 'Rebeca', apellido: 'Trujillo Maldonado', profesor: 'Gimena Reniero', dia: 'Jueves', horario: '19:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Maria Celeste Maldonado' },
  { nombre: 'Bastian', apellido: 'Fleischer', profesor: 'Gimena Reniero', dia: 'Jueves', horario: '19:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Viviana Alicia Veronica Sulka' },
  { nombre: 'Antonela', apellido: 'Jimenez', profesor: 'Gimena Reniero', dia: 'Jueves', horario: '19:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Santos Briceño Rocio' },
  { nombre: 'Paula', apellido: 'Blanco Rochaix', profesor: 'Gimena Reniero', dia: 'Jueves', horario: '19:30', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Luciana Natalia Rochaix' },

  // GRUPO B2 - Viernes 18:00
  { nombre: 'Sofia Lujan', apellido: 'Lamas', profesor: 'Fabricio Carinelli', dia: 'Viernes', horario: '18:00', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Azucena Atanasia Salva' },
  { nombre: 'Barrales Agustín', apellido: 'Gastón', profesor: 'Fabricio Carinelli', dia: 'Viernes', horario: '18:00', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Maria Lujan Fritz' },
  { nombre: 'Felipe', apellido: 'Negrette', profesor: 'Fabricio Carinelli', dia: 'Viernes', horario: '18:00', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Castro Salomé' },
  { nombre: 'Franco Leonel', apellido: 'Díaz', profesor: 'Fabricio Carinelli', dia: 'Viernes', horario: '18:00', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Federico Manuel Diaz / Claudia Pincheira' },
  { nombre: 'Jose', apellido: 'Sobrevilla', profesor: 'Fabricio Carinelli', dia: 'Viernes', horario: '18:00', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Monica Adriana Rios' },

  // GRUPO B3 - Lunes 18:00
  { nombre: 'Gino', apellido: 'Blasco', profesor: 'Gimena Reniero', dia: 'Lunes', horario: '18:00', grupo: 'B3', perfil: 'Base Progresivo', tutor: 'Gabriel Fernando Blasco Porro / Maria Adela reyes' },
  { nombre: 'Lucio', apellido: 'Ronchese', profesor: 'Gimena Reniero', dia: 'Lunes', horario: '18:00', grupo: 'B3', perfil: 'Base Progresivo', tutor: 'Jorge Julian Pepe / Laura Paola Ronchese' },
  { nombre: 'Mateo', apellido: 'Groia', profesor: 'Gimena Reniero', dia: 'Lunes', horario: '18:00', grupo: 'B3', perfil: 'Base Progresivo', tutor: 'Perez Romina Celina' },

  // GRUPO B3 - Martes 18:00
  { nombre: 'Amadeo', apellido: 'Gallardo', profesor: 'Gimena Reniero', dia: 'Martes', horario: '18:00', grupo: 'B3', perfil: 'Base Progresivo', tutor: 'Atilio Rolando Gallardo' },
  { nombre: 'Gael David', apellido: 'Díaz', profesor: 'Gimena Reniero', dia: 'Martes', horario: '18:00', grupo: 'B3', perfil: 'Base Progresivo', tutor: 'Federico Manuel Diaz / Pincheira Claudia' },
  { nombre: 'Benjamin', apellido: 'Porras', profesor: 'Gimena Reniero', dia: 'Martes', horario: '18:00', grupo: 'B3', perfil: 'Base Progresivo', tutor: 'Idania Margarita Abarca Zambrano' },
  { nombre: 'Melina', apellido: 'Diaz', profesor: 'Gimena Reniero', dia: 'Martes', horario: '18:00', grupo: 'B3', perfil: 'Base Progresivo', tutor: 'Diego Dante Diaz / Rita Lujan Raffaele' },

  // GRUPO B3 - Miércoles 18:00
  { nombre: 'Catalina', apellido: 'Iglesias', profesor: 'Gimena Reniero', dia: 'Miercoles', horario: '18:00', grupo: 'B3', perfil: 'Base Progresivo', tutor: 'Valeria Calero' },
  { nombre: 'Jazmin', apellido: 'Acosta', profesor: 'Gimena Reniero', dia: 'Miercoles', horario: '18:00', grupo: 'B3', perfil: 'Base Progresivo', tutor: 'Daniela Soledad Mangini' },
  { nombre: 'Nicolas', apellido: 'Schenone', profesor: 'Gimena Reniero', dia: 'Miercoles', horario: '18:00', grupo: 'B3', perfil: 'Base Progresivo', tutor: 'Adriana Lui' },
  { nombre: 'Eva', apellido: 'Sambueza', profesor: 'Gimena Reniero', dia: 'Miercoles', horario: '18:00', grupo: 'B3', perfil: 'Base Progresivo', tutor: 'Jesica Anahi Rodriguez' },

  // GRUPO B3 - Viernes 19:30
  { nombre: 'Joaquin', apellido: 'Fugante', profesor: 'Fabricio Carinelli', dia: 'Viernes', horario: '19:30', grupo: 'B3', perfil: 'Base Progresivo', tutor: 'Patricia Maccari Fugante' },
  { nombre: 'Adriana', apellido: 'Patti', profesor: 'Fabricio Carinelli', dia: 'Viernes', horario: '19:30', grupo: 'B3', perfil: 'Base Progresivo', tutor: 'Bibiana Beatriz Bravo' },
  { nombre: 'Camilo', apellido: 'Torres', profesor: 'Fabricio Carinelli', dia: 'Viernes', horario: '19:30', grupo: 'B3', perfil: 'Base Progresivo', tutor: 'Julieta Lia Dominguez' },
  { nombre: 'Francisco', apellido: 'Vilte', profesor: 'Fabricio Carinelli', dia: 'Viernes', horario: '19:30', grupo: 'B3', perfil: 'Base Progresivo', tutor: 'Ariel Fernando Vilte' },

  // GRUPO L4 - Miércoles 20:00
  { nombre: 'Nicolas', apellido: 'Bellomo', profesor: 'Fabricio Carinelli', dia: 'Miercoles', horario: '20:00', grupo: 'L4', perfil: 'Base Progresivo', tutor: 'Graciela Benita Sarapura' },
  { nombre: 'Geraldin', apellido: 'Santos García', profesor: 'Fabricio Carinelli', dia: 'Miercoles', horario: '20:00', grupo: 'L4', perfil: 'Base Progresivo', tutor: 'Ketty Yamina Garcia Acosta' },
  { nombre: 'Felipe', apellido: 'Casarotto', profesor: 'Fabricio Carinelli', dia: 'Miercoles', horario: '20:00', grupo: 'L4', perfil: 'Base Progresivo', tutor: 'Jorgelina Adriana Soledad Perez' },
  { nombre: 'Ticiana', apellido: 'Peña', profesor: 'Fabricio Carinelli', dia: 'Miercoles', horario: '20:00', grupo: 'L4', perfil: 'Base Progresivo', tutor: 'Graciela Benita Sarapura' },

  // GRUPO L1 - Jueves 19:30
  { nombre: 'Laureano', apellido: 'Calalesina', profesor: 'Fabricio Carinelli', dia: 'Jueves', horario: '19:30', grupo: 'L1', perfil: 'Lógico Desafiante', tutor: 'Montoya Luciana' },
  { nombre: 'Abril', apellido: 'Dondi', profesor: 'Fabricio Carinelli', dia: 'Jueves', horario: '19:30', grupo: 'L1', perfil: 'Lógico Desafiante', tutor: 'Mariana Cecilia Zamar' },
  { nombre: 'Bautista', apellido: 'Porras', profesor: 'Fabricio Carinelli', dia: 'Jueves', horario: '19:30', grupo: 'L1', perfil: 'Lógico Desafiante', tutor: 'Idania Margarita Abarca Zambrano' },
  { nombre: 'Camilo', apellido: 'Torres', profesor: 'Fabricio Carinelli', dia: 'Jueves', horario: '19:30', grupo: 'L1', perfil: 'Lógico Desafiante', tutor: 'Julieta Lia Dominguez' },

  // GRUPO L2 - Martes 19:30
  { nombre: 'Nereo', apellido: 'Digiacomo', profesor: 'Fabricio Carinelli', dia: 'Martes', horario: '19:30', grupo: 'L2', perfil: 'Lógico Desafiante', tutor: 'Cecilia Beatriz Gramajo' },
  { nombre: 'Padme', apellido: 'Demelza', profesor: 'Fabricio Carinelli', dia: 'Martes', horario: '19:30', grupo: 'L2', perfil: 'Lógico Desafiante', tutor: 'Yenisei del Rocio Fuentes Gutierrez' },
  { nombre: 'Ursula', apellido: 'Safi', profesor: 'Fabricio Carinelli', dia: 'Martes', horario: '19:30', grupo: 'L2', perfil: 'Lógico Desafiante', tutor: 'Orestes Antonio Safi / Nazarena Bardon' },
  { nombre: 'Tomás', apellido: 'Lambruschini', profesor: 'Fabricio Carinelli', dia: 'Martes', horario: '19:30', grupo: 'L2', perfil: 'Lógico Desafiante', tutor: "Patricia D'Alessandre" },
  { nombre: 'Mateo', apellido: 'Fiorenza', profesor: 'Fabricio Carinelli', dia: 'Martes', horario: '19:30', grupo: 'L2', perfil: 'Lógico Desafiante', tutor: 'Maria Ines Visco' },

  // GRUPO L3 - Jueves 18:00
  { nombre: 'Nicolas', apellido: 'Celiz', profesor: 'Fabricio Carinelli', dia: 'Jueves', horario: '18:00', grupo: 'L3', perfil: 'Lógico Desafiante', tutor: 'Andrea Benitez' },
  { nombre: 'Mateo', apellido: 'Sambueza', profesor: 'Fabricio Carinelli', dia: 'Jueves', horario: '18:00', grupo: 'L3', perfil: 'Lógico Desafiante', tutor: 'Eva sambueza' },
  { nombre: 'Pilar', apellido: 'Gonzalez Merlo', profesor: 'Fabricio Carinelli', dia: 'Jueves', horario: '18:00', grupo: 'L3', perfil: 'Lógico Desafiante', tutor: 'Carina Eugenia Merlo' },

  // PROGRAMACIÓN - Arduino Con Scratch - Lunes 18:00
  { nombre: 'Lucio', apellido: 'Long Wong', profesor: 'Marcos Reyeros', dia: 'Lunes', horario: '18:00', grupo: 'Arduino Con Scratch', perfil: 'Programación', tutor: 'Erika Cecil Gaspar Paredes' },
  { nombre: 'Augusto', apellido: 'Carrillo Bascary Rojas', profesor: 'Marcos Reyeros', dia: 'Lunes', horario: '18:00', grupo: 'Arduino Con Scratch', perfil: 'Programación', tutor: 'Laura Cecilia Rojas' },
  { nombre: 'Facundo', apellido: 'Torres Choque', profesor: 'Marcos Reyeros', dia: 'Lunes', horario: '18:00', grupo: 'Arduino Con Scratch', perfil: 'Programación', tutor: 'Lia Ines Torres' },

  // PROGRAMACIÓN - Arduino Con Scratch - Lunes 19:30
  { nombre: 'Benjamín', apellido: 'Torquato', profesor: 'Marcos Reyeros', dia: 'Lunes', horario: '19:30', grupo: 'Arduino Con Scratch', perfil: 'Programación', tutor: 'Gabriela Adriana Reynoso' },
  { nombre: 'Esteban', apellido: 'Crespo', profesor: 'Marcos Reyeros', dia: 'Lunes', horario: '19:30', grupo: 'Arduino Con Scratch', perfil: 'Programación', tutor: 'Laura María Diaz' },
  { nombre: 'Lucio', apellido: 'Ronchese', profesor: 'Marcos Reyeros', dia: 'Lunes', horario: '19:30', grupo: 'Arduino Con Scratch', perfil: 'Programación', tutor: 'Jorge Julian Pepe / Laura Paola Ronchese' },
  { nombre: 'Santino', apellido: 'Budaretto', profesor: 'Marcos Reyeros', dia: 'Lunes', horario: '19:30', grupo: 'Arduino Con Scratch', perfil: 'Programación', tutor: 'Vanesa Alejandra Laso' },
  { nombre: 'Jazmin', apellido: 'Acosta', profesor: 'Marcos Reyeros', dia: 'Lunes', horario: '19:30', grupo: 'Arduino Con Scratch', perfil: 'Programación', tutor: 'Daniela Soledad Mangini' },

  // PROGRAMACIÓN - Matemáticas + Scratch - Jueves 18:00
  { nombre: 'Ludovico', apellido: 'Samperi Durán', profesor: 'Marcos Reyeros', dia: 'Jueves', horario: '18:00', grupo: 'Matemáticas + Scratch', perfil: 'Programación', tutor: 'Maria Delfina Samperi' },

  // PROGRAMACIÓN - Roblox Studio - Jueves 19:30
  { nombre: 'Benjamin', apellido: 'Ferrini', profesor: 'Marcos Reyeros', dia: 'Jueves', horario: '19:30', grupo: 'Roblox Studio', perfil: 'Programación', tutor: 'Manuel Ferrini' },
  { nombre: 'Lionel', apellido: 'Celiz', profesor: 'Marcos Reyeros', dia: 'Jueves', horario: '19:30', grupo: 'Roblox Studio', perfil: 'Programación', tutor: 'Andrea Celiz' },
  { nombre: 'Bruno', apellido: 'Mella Toranzo', profesor: 'Marcos Reyeros', dia: 'Jueves', horario: '19:30', grupo: 'Roblox Studio', perfil: 'Programación', tutor: 'Natalia Soledad Toranzo' },

  // MATEMÁTICAS - Grupo Ayelen - Lunes 19:00
  { nombre: 'Theo', apellido: 'Ghesla', profesor: 'Ayelen Yañez', dia: 'Lunes', horario: '19:00', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Estefania Otero' },
  { nombre: 'Ulises Luis', apellido: 'Collar', profesor: 'Ayelen Yañez', dia: 'Lunes', horario: '19:00', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Joaquina Collar Yagas' },
  { nombre: 'Isabella', apellido: 'Schenonne', profesor: 'Ayelen Yañez', dia: 'Lunes', horario: '19:00', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Adriana Lui' },
  { nombre: 'Vicente', apellido: 'Wendt', profesor: 'Ayelen Yañez', dia: 'Lunes', horario: '19:00', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Noelia Luz Lopez' },
  { nombre: 'Dante', apellido: 'Migani', profesor: 'Ayelen Yañez', dia: 'Lunes', horario: '19:00', grupo: 'B2', perfil: 'Base Progresivo', tutor: 'Laura Hermoso' },

  // MATEMÁTICAS - Grupo L4 Alexis - Lunes 17:00
  { nombre: 'Clara', apellido: 'Regis', profesor: 'Alexis Figueroa', dia: 'Lunes', horario: '17:00', grupo: 'L4', perfil: 'Lógico Desafiante', tutor: 'Maria Guadalupe Torrado' },
  { nombre: 'Sofia', apellido: 'Salinas', profesor: 'Alexis Figueroa', dia: 'Lunes', horario: '17:00', grupo: 'L4', perfil: 'Lógico Desafiante', tutor: 'Carolina Garcia' },
  { nombre: 'Luis', apellido: 'Diaz', profesor: 'Alexis Figueroa', dia: 'Lunes', horario: '17:00', grupo: 'L4', perfil: 'Lógico Desafiante', tutor: 'Cecilia Diaz' },
  { nombre: 'Nicolas', apellido: 'Castro', profesor: 'Alexis Figueroa', dia: 'Lunes', horario: '17:00', grupo: 'L4', perfil: 'Lógico Desafiante', tutor: 'Nataly Roca' },
  { nombre: 'Alice', apellido: 'Ceballos', profesor: 'Alexis Figueroa', dia: 'Lunes', horario: '17:00', grupo: 'L4', perfil: 'Lógico Desafiante', tutor: 'Oskarly Ceballos' },

  // PROGRAMACIÓN - Videojuegos - Viernes 19:30
  { nombre: 'Josefina', apellido: 'Lensinas', profesor: 'Alexis Figueroa', dia: 'Viernes', horario: '19:30', grupo: 'Programación de videojuegos', perfil: 'Programación', tutor: 'Maria Viviana Leal' },
  { nombre: 'Estefania', apellido: 'Matias', profesor: 'Alexis Figueroa', dia: 'Viernes', horario: '19:30', grupo: 'Programación de videojuegos', perfil: 'Programación', tutor: 'Natalia Paola Crespo' },
  { nombre: 'Nahuel', apellido: 'Rodriguez', profesor: 'Alexis Figueroa', dia: 'Viernes', horario: '19:30', grupo: 'Programación de videojuegos', perfil: 'Programación', tutor: 'Diego Alejandro Rodriguez' },
  { nombre: 'Thiago', apellido: 'Rodriguez', profesor: 'Alexis Figueroa', dia: 'Viernes', horario: '19:30', grupo: 'Programación de videojuegos', perfil: 'Programación', tutor: 'Diego Alejandro Rodriguez' },
  { nombre: 'Dobler', apellido: 'Martina', profesor: 'Alexis Figueroa', dia: 'Viernes', horario: '19:30', grupo: 'Programación de videojuegos', perfil: 'Programación', tutor: 'Maria Mercedes Escudero' },
  { nombre: 'Julian Agustin', apellido: 'Figueroa', profesor: 'Alexis Figueroa', dia: 'Viernes', horario: '19:30', grupo: 'Programación de videojuegos', perfil: 'Programación', tutor: 'Carolina Alejandra Gonzalez' },
  { nombre: 'Valentino', apellido: 'Gimenez', profesor: 'Alexis Figueroa', dia: 'Viernes', horario: '19:30', grupo: 'Programación de videojuegos', perfil: 'Programación', tutor: 'Silvina Maricel Castañon' },
  { nombre: 'Giuliana', apellido: 'Schenonne', profesor: 'Alexis Figueroa', dia: 'Viernes', horario: '19:30', grupo: 'Programación de videojuegos', perfil: 'Programación', tutor: 'Adriana Lui' },
  { nombre: 'Diego Paolo', apellido: 'Colman Gonzalez', profesor: 'Alexis Figueroa', dia: 'Viernes', horario: '19:30', grupo: 'Programación de videojuegos', perfil: 'Programación', tutor: 'Colman Recarte Pablo Edinson' },
  { nombre: 'Octavio', apellido: 'Lensinas', profesor: 'Alexis Figueroa', dia: 'Viernes', horario: '19:30', grupo: 'Programación de videojuegos', perfil: 'Programación', tutor: 'Maria Viviana Leal' },
  { nombre: 'Julian', apellido: 'Taniguchi', profesor: 'Alexis Figueroa', dia: 'Viernes', horario: '19:30', grupo: 'Programación de videojuegos', perfil: 'Programación', tutor: 'Griselda Brenda Riquelme' },

  // ASTRONOMÍA - Miércoles 14:30
  { nombre: 'Juan Bautista', apellido: 'Memole', profesor: 'Alexis Figueroa', dia: 'Miercoles', horario: '14:30', grupo: 'Astronomía', perfil: 'Divulgación', tutor: 'María Jimena Zanin' },
  { nombre: 'Augusto', apellido: 'Carrillo Bascary Rojas', profesor: 'Alexis Figueroa', dia: 'Miercoles', horario: '14:30', grupo: 'Astronomía', perfil: 'Divulgación', tutor: 'Laura Cecilia Rojas' },
  { nombre: 'Amadeo', apellido: 'Cambero', profesor: 'Alexis Figueroa', dia: 'Miercoles', horario: '14:30', grupo: 'Astronomía', perfil: 'Divulgación', tutor: 'Leila Cambero' },

  // ASTRONOMÍA - Jueves 18:00
  { nombre: 'Rafael', apellido: 'Massa', profesor: 'Alexis Figueroa', dia: 'Jueves', horario: '18:00', grupo: 'Astronomía', perfil: 'Divulgación', tutor: 'Seoane Fernanda' },
  { nombre: 'Máximo Nicolas', apellido: 'Cal', profesor: 'Alexis Figueroa', dia: 'Jueves', horario: '18:00', grupo: 'Astronomía', perfil: 'Divulgación', tutor: 'Natalia Fernanda Vecchioli' },

  // MATEMÁTICA FINANCIERA - Miércoles 18:30
  { nombre: 'Diego Paolo', apellido: 'Colman Gonzalez', profesor: 'Alexis Figueroa', dia: 'Miercoles', horario: '18:30', grupo: 'Matemática Financiera', perfil: 'Divulgación', tutor: 'Colman Recarte Pablo Edinson' },

  // MATEMÁTICA FINANCIERA - Jueves 14:30
  { nombre: 'Máximo', apellido: 'Weimann', profesor: 'Alexis Figueroa', dia: 'Jueves', horario: '14:30', grupo: 'Matemática Financiera', perfil: 'Divulgación', tutor: 'Lidia Virginia Diaz' },
];

async function main() {
  console.log('🚀 Importando 113 estudiantes reales de Mateatletas...\n');

  // Mapa para rastrear tutores ya creados
  const tutoresMap = new Map<string, string>();
  const estudiantesMap = new Map<string, string>();

  let tutoresCreados = 0;
  let estudiantesCreados = 0;
  let inscripcionesCreadas = 0;

  for (const data of estudiantes) {
    try {
      // 1. CREAR/OBTENER TUTOR
      let tutorId: string;
      const tutorKey = data.tutor.toLowerCase().trim();

      if (tutoresMap.has(tutorKey)) {
        tutorId = tutoresMap.get(tutorKey)!;
      } else {
        // Crear nuevo tutor
        const tutorNombres = data.tutor.split(' ');
        const tutorNombre = tutorNombres[0];
        const tutorApellido = tutorNombres.slice(1).join(' ') || tutorNombres[0];

        // Username: solo nombre.apellido (sin "tutor." ni email)
        const tutorUsername = `${tutorNombre.toLowerCase()}.${tutorApellido.toLowerCase().replace(/\s+/g, '.')}`.replace(/[^\w.]/g, '');
        const tutorEmail = `${tutorUsername}@mateatletas.com`;

        // Contraseña temporal de 4 dígitos
        const passwordTemporal = Math.floor(1000 + Math.random() * 9000).toString();
        const hashedPasswordTemporal = await bcrypt.hash(passwordTemporal, 10);

        const tutor = await prisma.tutor.upsert({
          where: { email: tutorEmail },
          update: {},
          create: {
            email: tutorEmail,
            username: tutorUsername,
            password_hash: hashedPasswordTemporal,
            password_temporal: passwordTemporal, // Guardar para que sea visible
            debe_cambiar_password: true,
            nombre: tutorNombre,
            apellido: tutorApellido,
          },
        });

        tutorId = tutor.id;
        tutoresMap.set(tutorKey, tutorId);
        tutoresCreados++;
        console.log(`  👤 Tutor: ${tutorUsername} (password: ${passwordTemporal})`);
      }

      // 2. CREAR ESTUDIANTE
      const username = `${data.nombre.toLowerCase()}.${data.apellido.toLowerCase()}`.replace(/\s+/g, '.');
      const estudianteKey = username;

      let estudianteId: string;

      if (estudiantesMap.has(estudianteKey)) {
        estudianteId = estudiantesMap.get(estudianteKey)!;
      } else {
        const email = `${username}@estudiante.com`;

        // Contraseña FIJA de 4 dígitos para estudiantes (NO temporal, NO cambian)
        const passwordFija = Math.floor(1000 + Math.random() * 9000).toString();
        const hashedPasswordEst = await bcrypt.hash(passwordFija, 10);

        const estudiante = await prisma.estudiante.upsert({
          where: { username },
          update: {},
          create: {
            username,
            email,
            password_hash: hashedPasswordEst,
            password_temporal: passwordFija, // Guardamos el PIN en este campo para poder verlo
            debe_cambiar_password: false, // Los estudiantes NO cambian contraseña
            nombre: data.nombre,
            apellido: data.apellido,
            edad: 10, // Edad por defecto
            nivel_escolar: data.perfil,
            tutor: { connect: { id: tutorId } },
          },
        });

        estudianteId = estudiante.id;
        estudiantesMap.set(estudianteKey, estudianteId);
        estudiantesCreados++;
        console.log(`  ✓ ${data.nombre} ${data.apellido} (PIN fijo: ${passwordFija})`);
      }

      // 3. INSCRIBIR EN GRUPO
      const grupoCodigo = getGrupoCodigo(data.grupo, data.dia, data.horario);

      const grupo = await prisma.claseGrupo.findFirst({
        where: { codigo: grupoCodigo },
      });

      if (grupo) {
        // Verificar si ya está inscrito
        const yaInscrito = await prisma.inscripcionClaseGrupo.findUnique({
          where: {
            clase_grupo_id_estudiante_id: {
              clase_grupo_id: grupo.id,
              estudiante_id: estudianteId,
            },
          },
        });

        if (!yaInscrito) {
          await prisma.inscripcionClaseGrupo.create({
            data: {
              clase_grupo_id: grupo.id,
              estudiante_id: estudianteId,
              tutor_id: tutorId,
            },
          });
          inscripcionesCreadas++;
        }
      } else {
        console.log(`  ⚠️  Grupo no encontrado: ${grupoCodigo} para ${data.nombre} ${data.apellido}`);
      }

    } catch (error: any) {
      console.log(`  ✗ Error con ${data.nombre} ${data.apellido}: ${error.message}`);
    }
  }

  console.log('\n========================================');
  console.log('✅ IMPORTACIÓN COMPLETADA');
  console.log('========================================');
  console.log(`👨‍👩‍👧 Tutores creados: ${tutoresCreados}`);
  console.log(`👶 Estudiantes creados: ${estudiantesCreados}`);
  console.log(`📝 Inscripciones creadas: ${inscripcionesCreadas}`);
  console.log('\n🔑 SISTEMA DE CONTRASEÑAS:');
  console.log('   • Tutores: PIN temporal de 4 dígitos (ver arriba)');
  console.log('     → Deben cambiar contraseña en primer login');
  console.log('   • Estudiantes: PIN FIJO de 4 dígitos (ver arriba)');
  console.log('     → NO cambian contraseña, PIN permanente');
  console.log('   • Username tutores: nombre.apellido');
  console.log('   • Username estudiantes: nombre.apellido\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la importación:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
