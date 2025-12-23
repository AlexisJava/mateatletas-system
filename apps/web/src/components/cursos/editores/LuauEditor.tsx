'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { marked } from 'marked';
import { Exercise, QuizData } from '@/types/roblox';
// import QuizInteractivo from '@/components/astro/2/QuizInteractivo'; // DISABLED: Component removed

const EXERCISES: Exercise[] = [
  // ========================================
  // INTRODUCCIÓN - Conceptos (1-12)
  // ========================================
  {
    id: 1,
    title: 'Bienvenido al Mundo de Roblox',
    theory: `Alex Balfanz tenía 13 años cuando escribió su primer código en Roblox.

Era algo simple, pero poderoso:

print("¡Hola mundo!")

Dos años después creó Jailbreak, uno de los juegos más jugados de Roblox con 5 BILLONES de visitas.

Y todo empezó con esa línea de código.

Programar es como aprender un nuevo idioma. Le das instrucciones a la computadora, paso a paso, y ella hace que las cosas cobren vida.

¿Listo para empezar tu aventura?`,
    image_url: '/images/roblox/slides/slide-1.png',
    description: 'Ejecutá tu primer código',
    difficulty: 'Básico',
    mode: 'theory',
    starter_code: 'print("¡Hola, soy un programador!")',
    solution: 'print("¡Hola, soy un programador!")',
    expected_output: ['¡Hola, soy un programador!'],
    hints: ['Solo hacé clic en Ejecutar'],
    test_cases: [{ description: 'Ejecuta el código', check: (code) => code.includes('print(') }],
  },
  {
    id: 2,
    title: 'Tu Varita Mágica: Luau',
    theory: `Luau es el lenguaje de programación que usa Roblox.

Pensá en juegos como "Adopt Me!" con más de 50 BILLONES de visitas. Todo está hecho con Luau.

Las mascotas que caminan, los autos que manejas, las casas que decorás... todo eso es código Luau funcionando detrás de escena.

Lo mejor de Luau es que es fácil de aprender, pero súper poderoso. Es como tener una varita mágica que da vida a tus ideas.

Si Roblox fuera una ciudad, Luau sería el idioma que todos hablan.

Y millones de creadores ya lo están usando. Ahora es tu turno.`,
    image_url: '/images/roblox/slides/slide-2.png',
    description: 'Ejecutá tu mensaje de bienvenida a Luau',
    difficulty: 'Básico',
    mode: 'theory',
    starter_code: 'print("Luau es genial")\nprint("¡Voy a crear juegos!")',
    solution: 'print("Luau es genial")\nprint("¡Voy a crear juegos!")',
    expected_output: ['Luau es genial', '¡Voy a crear juegos!'],
    hints: ['Hacé clic en Ejecutar'],
    test_cases: [{ description: 'Ejecuta', check: (code) => code.includes('print(') }],
  },
  {
    id: 3,
    title: 'Las Cajas Mágicas: Variables',
    theory: `Imaginate que las variables son como cajas con etiquetas.

En el supermercado, tenés una caja que dice "Cereales" y adentro están los cereales. Otra que dice "Galletas" y adentro están las galletas.

En programación es igual. Creás una caja con un nombre, y guardás algo adentro.

Por ejemplo, en Tower of Hell podrías tener:

nombre = "Mateatleta"
puntos = 100
tiempo = 45

Cuando escribís:

local nombre = "Mateatleta"

Le estás diciendo a la computadora: "Creá una caja llamada nombre y guardá Mateatleta adentro".

Y podés crear miles de variables. Tantas como necesites para tu juego.`,
    image_url: '/images/roblox/slides/slide-3.png',
    description: 'Mirá cómo funciona una variable',
    difficulty: 'Básico',
    mode: 'theory',
    starter_code: 'local nombre = "Alex"\nprint("Mi nombre es:", nombre)',
    solution: 'local nombre = "Alex"\nprint("Mi nombre es:", nombre)',
    expected_output: ['Mi nombre es: Alex'],
    hints: ['Solo ejecutá'],
    test_cases: [{ description: 'Usa variable', check: (code) => code.includes('local') }],
  },
  {
    id: 4,
    title: 'Los Ingredientes del Código',
    theory: `Así como una pizza tiene diferentes ingredientes (tomate, queso, jamón), en programación tenés diferentes tipos de datos.

En Luau, los 3 tipos principales son:

NÚMEROS
Como puntos = 100 o vida = 50
Se usan para contar, calcular, medir.

TEXTO (strings)
Como nombre = "Mateatleta" o nivel = "Level 5"
Se usan para palabras, mensajes, nombres.

BOOLEANOS (true o false)
Como vivo = true o tiene_arma = false
Se usan para responder preguntas de sí o no.

Por ejemplo, en Brookhaven:
• Tu nombre es TEXTO
• Tu dinero es un NÚMERO
• Si estás en casa es un BOOLEANO

Cada tipo de dato tiene su propio superpoder y se usa para cosas diferentes.`,
    image_url: '/images/roblox/slides/slide-4.png',
    description: 'Mirá los diferentes tipos de datos',
    difficulty: 'Básico',
    mode: 'theory',
    starter_code:
      'local num = 10\nlocal texto = "Hola"\nlocal bool = true\n\nprint(num, texto, bool)',
    solution: 'local num = 10\nlocal texto = "Hola"\nlocal bool = true\nprint(num, texto, bool)',
    expected_output: ['10 Hola true'],
    hints: ['Ejecutá para ver los 3 tipos'],
    test_cases: [{ description: 'Tiene variables', check: (code) => code.includes('local') }],
  },
  {
    id: 5,
    title: 'Las Funciones: Tu Primer Botón Mágico',
    theory: `Una función es como un botón que programás para hacer algo específico.

Pensalo así:

1. Definís la función (creás el botón)
2. La llamás (apretás el botón)
3. Se ejecuta el código que pusiste adentro

Es como cuando en un juego tenés un botón de "Saltar". Alguien programó esa función una vez, y ahora cada vez que lo apretás, hace lo mismo.

Ejemplo simple:

function saludar()
  print("Hola")
end

Ahora cada vez que escribas saludar(), va a imprimir "Hola".

Las funciones son poderosas porque te dejan reutilizar código. Escribís algo una vez, y lo usás mil veces.`,
    image_url: '/images/roblox/slides/slide-5.png',
    description: 'Mirá cómo funciona',
    difficulty: 'Básico',
    mode: 'theory',
    starter_code: 'local function decirHola()\n  print("¡Hola!")\nend\n\ndecirHola()\ndecirHola()',
    solution: 'local function decirHola()\n  print("¡Hola!")\nend\ndecirHola()\ndecirHola()',
    expected_output: ['¡Hola!', '¡Hola!'],
    hints: ['Se ejecuta 2 veces'],
    test_cases: [{ description: 'Define función', check: (code) => code.includes('function') }],
  },
  {
    id: 6,
    title: 'Decisiones Inteligentes: IF',
    theory: `El código puede tomar decisiones por sí solo.

Es como cuando vas a cruzar la calle:

SI el semáforo está verde → cruzás
SI NO → esperás

En programación usamos "if" (que significa "si" en inglés) para hacer lo mismo.

Ejemplo:

if edad > 10 then
  print("Sos grande")
end

Acá le estás diciendo a la computadora:

"Si la edad es mayor a 10, entonces imprimí 'Sos grande'."

En los juegos se usa todo el tiempo. ¿El jugador tiene más de 100 puntos? Entonces pasá de nivel. ¿Se quedó sin vida? Entonces game over.

Los condicionales hacen que tu código sea inteligente y responda a diferentes situaciones.`,
    image_url: '/images/roblox/slides/slide-6.png',
    description: 'Mirá cómo decide el código',
    difficulty: 'Básico',
    mode: 'theory',
    starter_code: 'local edad = 12\n\nif edad > 10 then\n  print("Sos grande")\nend',
    solution: 'local edad = 12\nif edad > 10 then\n  print("Sos grande")\nend',
    expected_output: ['Sos grande'],
    hints: ['El if verifica la edad'],
    test_cases: [{ description: 'Usa if', check: (code) => code.includes('if') }],
  },
  {
    id: 7,
    title: 'El Poder de la Repetición: BUCLES',
    theory: `Imaginate que tenés que escribir "Hola" 100 veces.

Podrías hacerlo manualmente, pero tardarías horas. O podrías usar un bucle y hacerlo en 2 segundos.

Los bucles repiten código automáticamente.

En vez de escribir:

print(1)
print(2)
print(3)
print(4)
print(5)

Podés escribir:

for i = 1, 5 do
  print(i)
end

Y hace exactamente lo mismo.

En los juegos se usan bucles constantemente. Para crear 50 enemigos, para generar un mapa, para revisar todos los jugadores...

Los bucles son la forma de hacer que la computadora haga el trabajo pesado por vos.`,
    image_url: '/images/roblox/slides/slide-7.png',
    description: 'Mirá cómo se repite',
    difficulty: 'Básico',
    mode: 'theory',
    starter_code: 'for i = 1, 5 do\n  print("Número:", i)\nend',
    solution: 'for i = 1, 5 do\n  print("Número:", i)\nend',
    expected_output: ['Número: 1', 'Número: 2', 'Número: 3', 'Número: 4', 'Número: 5'],
    hints: ['Se repite 5 veces'],
    test_cases: [{ description: 'Usa for', check: (code) => code.includes('for') }],
  },
  {
    id: 8,
    title: 'Matemáticas en Acción: OPERADORES',
    theory: `Los operadores son símbolos que le dicen a la computadora qué hacer con los números y datos.

Hay varios tipos:

MATEMÁTICOS
+ (suma), - (resta), * (multiplicación), / (división)

Ejemplo: 5 + 3 da 8

COMPARACIÓN
== (igual a), > (mayor que), < (menor que)

Ejemplo: 10 > 5 da true (verdadero)

LÓGICOS
and (y), or (o), not (no)

Los operadores son como las herramientas de una caja de herramientas. Cada uno sirve para algo diferente, y los vas a usar constantemente en tus juegos.

¿Querés sumar puntos? Usás +
¿Querés ver si un jugador tiene más vida que otro? Usás >
¿Querés verificar dos condiciones? Usás and`,
    image_url: '/images/roblox/slides/slide-8.png',
    description: 'Mirá los operadores',
    difficulty: 'Básico',
    mode: 'theory',
    starter_code:
      'local suma = 10 + 5\nlocal resta = 10 - 5\n\nprint("Suma:", suma)\nprint("Resta:", resta)',
    solution:
      'local suma = 10 + 5\nlocal resta = 10 - 5\nprint("Suma:", suma)\nprint("Resta:", resta)',
    expected_output: ['Suma: 15', 'Resta: 5'],
    hints: ['Operadores matemáticos básicos'],
    test_cases: [{ description: 'Usa operadores', check: (code) => /[\+\-]/.test(code) }],
  },
  {
    id: 9,
    title: 'Notas Secretas: COMENTARIOS',
    theory: `Los comentarios son mensajes que dejás en tu código para explicar qué hace.

Lo importante: la computadora los ignora completamente. Son solo para humanos.

En Luau, los comentarios empiezan con dos guiones: --

Ejemplo:

-- Este es un comentario
print("Hola") -- Esto también es un comentario

¿Para qué sirven?

Para explicarte a vos mismo (o a otros) qué hace tu código. Porque cuando vuelvas a mirar tu código en una semana, capaz no te acordás qué hacía cada parte.

También sirven para "apagar" código temporalmente sin borrarlo:

-- print("No quiero que esto se ejecute ahora")

Los buenos programadores comentan su código. Te va a ahorrar muchos dolores de cabeza.`,
    image_url: '/images/roblox/slides/slide-9.png',
    description: 'Mirá cómo funcionan',
    difficulty: 'Básico',
    mode: 'theory',
    starter_code:
      '-- Este es un comentario\nprint("Este código SÍ se ejecuta")\n-- print("Este NO")',
    solution: '-- Este es un comentario\nprint("Este código SÍ se ejecuta")',
    expected_output: ['Este código SÍ se ejecuta'],
    hints: ['Los -- son comentarios'],
    test_cases: [{ description: 'Tiene comentarios', check: (code) => code.includes('--') }],
  },
  {
    id: 10,
    title: 'Los 3 Tipos de Scripts en Roblox',
    theory: `En Roblox Studio hay 3 tipos de scripts. Cada uno funciona diferente.

SCRIPT (server script)
Se ejecuta en el servidor. Todos los jugadores lo ven.
Ejemplo: un enemigo que camina por el mapa.

LOCAL SCRIPT
Se ejecuta solo para un jugador específico.
Ejemplo: la interfaz de tu inventario personal.

MODULE SCRIPT
Es código que podés reutilizar en otros scripts.
Ejemplo: una función de daño que usás en varias armas.

¿Cuál usar?

Si algo lo ven todos: Script normal
Si es solo para un jugador: LocalScript
Si querés organizar código: ModuleScript

Al principio puede parecer confuso, pero con la práctica vas a saber instintivamente cuál necesitás.`,
    image_url: '/images/roblox/slides/slide-10.png',
    description: 'Lee sobre los tipos de scripts',
    difficulty: 'Básico',
    mode: 'theory',
    starter_code: 'print("Soy un script")\nprint("Controlo el juego")',
    solution: 'print("Soy un script")\nprint("Controlo el juego")',
    expected_output: ['Soy un script', 'Controlo el juego'],
    hints: ['Ejecutá el código'],
    test_cases: [{ description: 'Ejecuta', check: (code) => code.includes('print(') }],
  },
  {
    id: 11,
    title: 'Juntando Todo: Tu Primer Programa',
    theory: `Ahora es momento de combinar todo lo que aprendiste.

Variables, operadores, print... todo junto.

Es como cuando aprendés las notas musicales por separado (Do, Re, Mi) y después las combinás para tocar una canción.

Al principio parece raro, pero después se vuelve natural.

Vamos a crear un programa simple que muestre el nombre de un jugador y sus puntos.

Nada del otro mundo, pero es TU programa. Lo hiciste vos.

Y esto es apenas el comienzo. Con estos mismos conceptos básicos, podés construir juegos completos.

La diferencia entre un principiante y un experto no es que el experto sepa cosas mágicas. Simplemente sabe combinar los conceptos básicos de formas creativas.`,
    image_url: '/images/roblox/slides/slide-11.png',
    description: 'Creá un sistema de puntos simple con nombre y puntos',
    difficulty: 'Básico',
    mode: 'theory',
    starter_code:
      '-- Completá el código\nlocal jugador = \nlocal puntos = \n\nprint("Jugador:", jugador)\nprint("Puntos:", puntos)',
    solution:
      'local jugador = "Alex"\nlocal puntos = 100\nprint("Jugador:", jugador)\nprint("Puntos:", puntos)',
    expected_output: ['Jugador: Alex', 'Puntos: 100'],
    hints: ['Poné un nombre entre comillas', 'Los puntos son un número'],
    test_cases: [
      {
        description: 'Declara variables',
        check: (code) => (code.match(/local\s+\w+\s*=/g) || []).length >= 2,
      },
      { description: 'Usa print', check: (code) => code.includes('print(') },
    ],
  },
  {
    id: 12,
    title: 'Repaso Final: Todo Junto',
    theory: `Mirá todo lo que aprendiste hasta ahora:

Variables para guardar datos
Tipos de datos (números, texto, booleanos)
Funciones para reutilizar código
Condicionales para tomar decisiones
Bucles para repetir acciones
Operadores para hacer cálculos y comparaciones
Comentarios para explicar tu código
Scripts de Roblox para dar vida a tus juegos

Es un montón, ¿no?

Pero lo importante no es memorizar todo. Lo importante es entender los conceptos.

Cuando necesites algo específico, siempre podés buscarlo. Lo que importa es que sepas QUÉ herramientas existen y CUÁNDO usarlas.

Ahora viene lo mejor: la práctica.

Vas a empezar a resolver ejercicios, y vas a ver cómo todo esto se conecta. Es ahí donde realmente aprendés.

¿Listo para el siguiente nivel?`,
    image_url: '/images/roblox/slides/slide-12.png',
    description: 'Ejecutá este ejemplo completo',
    difficulty: 'Básico',
    mode: 'theory',
    starter_code:
      'local nombre = "Mateatleta"\nlocal nivel = 5\n\nprint("Jugador:", nombre)\n\nif nivel >= 5 then\n  print("¡Nivel alto!")\nend\n\nfor i = 1, 3 do\n  print("Estrella", i)\nend',
    solution:
      'local nombre = "Mateatleta"\nlocal nivel = 5\nprint("Jugador:", nombre)\nif nivel >= 5 then\n  print("¡Nivel alto!")\nend\nfor i = 1, 3 do\n  print("Estrella", i)\nend',
    expected_output: [
      'Jugador: Mateatleta',
      '¡Nivel alto!',
      'Estrella 1',
      'Estrella 2',
      'Estrella 3',
    ],
    hints: ['Solo ejecutá'],
    test_cases: [
      {
        description: 'Combina conceptos',
        check: (code) => code.includes('local') && code.includes('if') && code.includes('for'),
      },
    ],
  },

  // ========================================
  // BÁSICOS - Fundamentos (13-20)
  // ========================================
  {
    id: 13,
    title: '13. Print - Mostrar texto',
    theory: `📚 TEORÍA: La función print()

En Luau (y Lua), print() es la forma más básica de mostrar información en la consola.
Es como hablarle a la computadora para que te muestre algo.

Sintaxis:
  print("tu mensaje")
  print(variable)
  print("texto", variable, "más texto")

Los strings (texto) van entre comillas dobles "texto" o simples 'texto'.
Podés imprimir múltiples cosas separándolas con comas.`,
    description: 'Escribí un script que imprima "Hola, Roblox!" en la consola.',
    difficulty: 'Básico',
    mode: 'practice',
    starter_code: '-- Usá print() para mostrar el mensaje\n',
    solution: 'print("Hola, Roblox!")',
    expected_output: ['Hola, Roblox!'],
    hints: ['Usá print() seguido de paréntesis', 'El texto va entre comillas: "Hola, Roblox!"'],
    test_cases: [
      {
        description: 'Contiene print()',
        check: (code) => code.includes('print('),
      },
      {
        description: 'Contiene el texto "Hola, Roblox!"',
        check: (code) => code.includes('Hola, Roblox!'),
      },
    ],
  },
  {
    id: 14,
    title: '14. Variables - Guardar datos',
    theory: `📚 TEORÍA: Variables

Las variables son como "cajitas" que guardan información.
En Luau, usamos "local" para crear una variable.

Sintaxis:
  local nombre = valor

Ejemplos:
  local edad = 15
  local nombre = "Alex"
  local vivo = true

Tipos de datos:
  • Números: 100, 3.14, -5
  • Strings: "texto"
  • Booleanos: true o false
  • nil: vacío/nada`,
    description: 'Creá una variable con un número (ej: puntos, score, vida) e imprimila.',
    difficulty: 'Básico',
    mode: 'practice',
    starter_code: '-- Creá una variable con un número\n\n-- Imprimila\n',
    solution: 'local puntos = 100\nprint("Puntos:", puntos)',
    expected_output: ['Puntos: 100'],
    hints: ['Usá: local nombreVariable = valor', 'Luego imprimí con print()'],
    test_cases: [
      {
        description: 'Declara una variable con local',
        check: (code) => /local\s+\w+\s*=\s*\d+/.test(code),
      },
      {
        description: 'Imprime algo',
        check: (code) => code.includes('print('),
      },
    ],
  },
  {
    id: 15,
    title: '15. Operaciones Matemáticas',
    theory: `📚 TEORÍA: Operadores Matemáticos

Luau puede hacer cálculos como una calculadora:

  +  suma
  -  resta
  *  multiplicación
  /  división
  ^  potencia
  %  módulo (resto de división)

Ejemplos:
  local suma = 10 + 5      -- 15
  local resta = 10 - 5     -- 5
  local multi = 10 * 5     -- 50
  local div = 10 / 5       -- 2
  local pot = 2 ^ 3        -- 8
  local mod = 10 % 3       -- 1`,
    description:
      'Creá dos variables numéricas y realizá una operación matemática (suma, resta, etc).',
    difficulty: 'Básico',
    mode: 'practice',
    starter_code:
      '-- Creá dos variables numéricas\n\n-- Hacé una operación matemática\n\n-- Imprimí el resultado\n',
    solution:
      'local vida = 100\nlocal daño = 25\nlocal vidaRestante = vida - daño\nprint("Vida restante:", vidaRestante)',
    expected_output: ['Vida restante: 75'],
    hints: ['Usá operadores: +, -, *, /', 'Guardá el resultado en una nueva variable'],
    test_cases: [
      {
        description: 'Declara dos variables numéricas',
        check: (code) => (code.match(/local\s+\w+\s*=\s*\d+/g) || []).length >= 2,
      },
      {
        description: 'Realiza una operación matemática',
        check: (code) => /[\+\-\*\/]/.test(code),
      },
      {
        description: 'Imprime el resultado',
        check: (code) => code.includes('print('),
      },
    ],
  },
  {
    id: 16,
    title: '16. Concatenación - Unir texto',
    theory: `📚 TEORÍA: Concatenación de Strings

Para unir texto en Luau, usamos el operador ".."

Sintaxis:
  local texto = "Hola" .. " " .. "Mundo"
  -- Resultado: "Hola Mundo"

Podés unir strings con variables:
  local nombre = "Alex"
  local saludo = "Hola, " .. nombre .. "!"
  -- Resultado: "Hola, Alex!"

También podés unir números (se convierten a texto):
  local edad = 15
  local mensaje = "Tengo " .. edad .. " años"`,
    description: 'Creá dos variables de texto y unilas con el operador ".."',
    difficulty: 'Básico',
    mode: 'practice',
    starter_code: '-- Creá dos variables de texto\n\n-- Unilas con el operador ..\n',
    solution:
      'local nombre = "Alex"\nlocal apellido = "Figueroa"\nlocal nombreCompleto = nombre .. " " .. apellido\nprint(nombreCompleto)',
    expected_output: ['Alex Figueroa'],
    hints: ['Usá el operador .. para unir strings', 'Ejemplo: "Hola" .. " " .. "Mundo"'],
    test_cases: [
      {
        description: 'Declara dos variables de texto',
        check: (code) => (code.match(/local\s+\w+\s*=\s*["']/g) || []).length >= 2,
      },
      {
        description: 'Usa el operador de concatenación ..',
        check: (code) => code.includes('..'),
      },
    ],
  },
  {
    id: 17,
    title: '17. Comentarios',
    theory: `📚 TEORÍA: Comentarios

Los comentarios son notas para humanos, Luau los ignora.
Son super útiles para explicar tu código.

Comentario de una línea:
  -- Este es un comentario
  local x = 5  -- También podés comentar al lado

Comentario multi-línea:
  --[[
    Este es un comentario
    que ocupa varias líneas
  ]]

Buenos comentarios explican el "por qué", no el "qué".`,
    description:
      'Escribí código con una variable numérica y agregá comentarios explicando qué hace.',
    difficulty: 'Básico',
    mode: 'practice',
    starter_code: '-- Tu código con comentarios aquí\n',
    solution:
      '-- Variable que guarda la velocidad del jugador\nlocal velocidad = 50\n\n-- Mostramos la velocidad actual\nprint("Velocidad:", velocidad)',
    expected_output: ['Velocidad: 50'],
    hints: ['Usá -- para hacer comentarios', 'Comentá antes o después de cada línea de código'],
    test_cases: [
      {
        description: 'Tiene al menos un comentario',
        check: (code) => code.includes('--'),
      },
      {
        description: 'Declara una variable',
        check: (code) => /local\s+\w+\s*=/.test(code),
      },
      {
        description: 'Imprime la variable',
        check: (code) => code.includes('print('),
      },
    ],
  },
  {
    id: 18,
    title: '18. Type() - Tipo de dato',
    theory: `📚 TEORÍA: La función type()

type() te dice qué tipo de dato es algo.

Tipos en Luau:
  • "number" - números
  • "string" - texto
  • "boolean" - true/false
  • "table" - tablas/arrays
  • "function" - funciones
  • "nil" - vacío

Ejemplo:
  local edad = 15
  print(type(edad))  -- "number"

  local nombre = "Alex"
  print(type(nombre))  -- "string"`,
    description: 'Creá 3 variables de tipos diferentes y mostrá el tipo de cada una con type().',
    difficulty: 'Básico',
    mode: 'practice',
    starter_code:
      '-- Creá las variables\nlocal numero = \nlocal texto = \nlocal booleano = \n\n-- Mostrá sus tipos\n',
    solution:
      'local numero = 42\nlocal texto = "Hola"\nlocal booleano = true\n\nprint("Tipo de numero:", type(numero))\nprint("Tipo de texto:", type(texto))\nprint("Tipo de booleano:", type(booleano))',
    expected_output: [
      'Tipo de numero: number',
      'Tipo de texto: string',
      'Tipo de booleano: boolean',
    ],
    hints: ['Usá type(variable) para obtener el tipo', 'Creá un número, un string y un booleano'],
    test_cases: [
      {
        description: 'Usa type() al menos una vez',
        check: (code) => code.includes('type('),
      },
      {
        description: 'Declara al menos 3 variables',
        check: (code) => (code.match(/local\s+\w+\s*=/g) || []).length >= 3,
      },
    ],
  },
  {
    id: 19,
    title: '19. Múltiples valores en print',
    theory: `📚 TEORÍA: Print con múltiples valores

print() puede mostrar varias cosas a la vez, separadas por comas:

Sintaxis:
  print(valor1, valor2, valor3)

Ejemplo:
  local nombre = "Alex"
  local edad = 15
  print("Nombre:", nombre, "Edad:", edad)
  -- Output: Nombre: Alex Edad: 15

Es más fácil que concatenar con ..`,
    description: 'Creá 3 variables de cualquier tipo y mostralas todas en un solo print().',
    difficulty: 'Básico',
    mode: 'practice',
    starter_code: '-- Creá 3 variables\n\n-- Mostralas en un solo print\n',
    solution:
      'local nombre = "Alex"\nlocal edad = 15\nlocal ciudad = "Córdoba"\n\nprint("Nombre:", nombre, "Edad:", edad, "Ciudad:", ciudad)',
    expected_output: ['Nombre: Alex Edad: 15 Ciudad: Córdoba'],
    hints: [
      'Separá los valores con comas dentro de print()',
      'Ejemplo: print("A:", var1, "B:", var2)',
    ],
    test_cases: [
      {
        description: 'Usa print() con múltiples valores (separados por comas)',
        check: (code) => /print\([^)]+,[^)]+\)/.test(code),
      },
      {
        description: 'Declara al menos 3 variables',
        check: (code) => (code.match(/local\s+\w+\s*=/g) || []).length >= 3,
      },
    ],
  },
  {
    id: 20,
    title: '20. Reasignar variables',
    theory: `📚 TEORÍA: Modificar variables

Podés cambiar el valor de una variable después de crearla:

Sintaxis:
  local puntos = 0
  puntos = puntos + 10  -- Ahora vale 10
  puntos = puntos + 5   -- Ahora vale 15

No usés "local" de nuevo, solo el nombre.

Ejemplo:
  local vidas = 3
  print(vidas)  -- 3
  vidas = vidas - 1
  print(vidas)  -- 2`,
    description:
      'Creá una variable en 0 y sumale valores al menos 2 veces (sin usar "local" de nuevo).',
    difficulty: 'Básico',
    mode: 'practice',
    starter_code:
      '-- Creá una variable en 0\n\n-- Sumale valores (sin usar local)\n\n-- Mostrá el resultado\n',
    solution:
      'local contador = 0\nprint("Inicio:", contador)\n\ncontador = contador + 5\nprint("Después de +5:", contador)\n\ncontador = contador + 3\nprint("Después de +3:", contador)',
    expected_output: ['Inicio: 0', 'Después de +5: 5', 'Después de +3: 8'],
    hints: ['No uses "local" al reasignar', 'Sintaxis: variable = variable + valor'],
    test_cases: [
      {
        description: 'Crea una variable con local',
        check: (code) => /local\s+\w+\s*=\s*\d+/.test(code),
      },
      {
        description: 'Reasigna la variable al menos 2 veces',
        check: (code) => {
          const varName = (code.match(/local\s+(\w+)\s*=/) || [])[1];
          if (!varName) return false;
          const regex = new RegExp(`${varName}\\s*=\\s*${varName}\\s*[+\\-*/]`, 'g');
          const matches = code.match(regex);
          return matches ? matches.length >= 2 : false;
        },
      },
    ],
  },

  // CONDICIONALES (9-12)
  {
    id: 21,
    title: '21. If - Tomar decisiones',
    theory: `📚 TEORÍA: Condicionales IF

Los if permiten que el código tome decisiones.

Sintaxis:
  if condicion then
    -- código si es verdadero
  end

Operadores de comparación:
  ==  igual
  ~=  diferente
  >   mayor que
  <   menor que
  >=  mayor o igual
  <=  menor o igual

Ejemplo:
  local edad = 15
  if edad >= 13 then
    print("Sos adolescente")
  end`,
    description: 'Creá una variable numérica e imprimí un mensaje si es mayor que un valor.',
    difficulty: 'Básico',
    mode: 'practice',
    starter_code: '-- Creá una variable numérica\n\n-- Escribí un if para comparar\n',
    solution: 'local temperatura = 30\n\nif temperatura > 25 then\n  print("Hace calor")\nend',
    expected_output: ['Hace calor'],
    hints: ['Sintaxis: if condicion then ... end', 'Usá operadores: >, <, >=, <=, =='],
    test_cases: [
      {
        description: 'Usa if y then',
        check: (code) => code.includes('if') && code.includes('then'),
      },
      {
        description: 'Cierra con end',
        check: (code) => code.includes('end'),
      },
      {
        description: 'Usa un operador de comparación',
        check: (code) => /[><]=?|[=~]=/.test(code),
      },
    ],
  },
  {
    id: 22,
    title: '22. If-Else - Dos caminos',
    theory: `📚 TEORÍA: If-Else

Else ejecuta código cuando la condición es falsa:

Sintaxis:
  if condicion then
    -- código si es verdadero
  else
    -- código si es falso
  end

Ejemplo:
  local puntos = 45

  if puntos >= 50 then
    print("¡Ganaste!")
  else
    print("Perdiste")
  end`,
    description: 'Creá una variable numérica. Si es >= a un valor, imprimí un mensaje, sino otro.',
    difficulty: 'Básico',
    mode: 'practice',
    starter_code: '-- Creá una variable numérica\n\n-- Escribí el if-else\n',
    solution:
      'local puntos = 80\n\nif puntos >= 50 then\n  print("Aprobado")\nelse\n  print("Reprobado")\nend',
    expected_output: ['Aprobado'],
    hints: ['Usá if ... then ... else ... end', 'El operador >= significa "mayor o igual"'],
    test_cases: [
      {
        description: 'Usa if-else',
        check: (code) => code.includes('if') && code.includes('else'),
      },
      {
        description: 'Cierra con end',
        check: (code) => code.includes('end'),
      },
    ],
  },
  {
    id: 23,
    title: '23. Elseif - Múltiples condiciones',
    theory: `📚 TEORÍA: Elseif

Para verificar múltiples condiciones en orden:

Sintaxis:
  if condicion1 then
    -- código 1
  elseif condicion2 then
    -- código 2
  elseif condicion3 then
    -- código 3
  else
    -- código por defecto
  end

Ejemplo:
  local nota = 85
  if nota >= 90 then
    print("A")
  elseif nota >= 80 then
    print("B")
  else
    print("C")
  end`,
    description:
      'Creá una variable numérica. Usá if-elseif-else para imprimir mensajes según rangos.',
    difficulty: 'Intermedio',
    mode: 'practice',
    starter_code:
      '-- Creá una variable numérica\n\n-- Escribí if-elseif-else para distintos rangos\n',
    solution:
      'local nivel = 15\n\nif nivel < 10 then\n  print("Bronce")\nelseif nivel < 20 then\n  print("Plata")\nelse\n  print("Oro")\nend',
    expected_output: ['Plata'],
    hints: [
      'Usá elseif para la segunda condición',
      'Ejemplo: if x < 10 then ... elseif x < 20 then ... else ... end',
    ],
    test_cases: [
      {
        description: 'Usa elseif',
        check: (code) => code.includes('elseif'),
      },
      {
        description: 'Tiene if, elseif y else',
        check: (code) => code.includes('if') && code.includes('elseif') && code.includes('else'),
      },
    ],
  },
  {
    id: 24,
    title: '24. Operadores lógicos',
    theory: `📚 TEORÍA: Operadores Lógicos

Combiná condiciones con:

  and  - ambas deben ser verdaderas
  or   - al menos una debe ser verdadera
  not  - invierte el valor

Ejemplos:
  -- AND: ambas deben cumplirse
  if edad >= 13 and edad <= 19 then
    print("Adolescente")
  end

  -- OR: una o la otra
  if dia == "sabado" or dia == "domingo" then
    print("Fin de semana")
  end

  -- NOT: niega la condición
  if not estaLloviendo then
    print("Podés salir")
  end`,
    description: 'Creá dos variables (una numérica y una booleana). Usá "and" en un if.',
    difficulty: 'Intermedio',
    mode: 'practice',
    starter_code: '-- Creá dos variables\n\n-- Escribí una condición con AND\n',
    solution:
      'local edad = 16\nlocal tienePermiso = true\n\nif edad >= 15 and tienePermiso then\n  print("Puede jugar")\nelse\n  print("No puede jugar")\nend',
    expected_output: ['Puede jugar'],
    hints: [
      'Usá "and" entre las dos condiciones',
      'Ejemplo: if condicion1 and condicion2 then ... end',
    ],
    test_cases: [
      {
        description: 'Usa el operador "and"',
        check: (code) => code.includes('and'),
      },
      {
        description: 'Tiene un if',
        check: (code) => code.includes('if') && code.includes('then'),
      },
    ],
  },

  // BUCLES (13-16)
  {
    id: 13,
    title: '13. For numérico - Repetir código',
    theory: `📚 TEORÍA: Bucle FOR numérico

Para repetir código un número específico de veces:

Sintaxis:
  for variable = inicio, fin do
    -- código a repetir
  end

También podés usar un paso (step):
  for i = inicio, fin, paso do
    -- código
  end

Ejemplos:
  -- Contar del 1 al 5
  for i = 1, 5 do
    print(i)
  end

  -- Contar de 2 en 2
  for i = 0, 10, 2 do
    print(i)  -- 0, 2, 4, 6, 8, 10
  end`,
    description: 'Usá un bucle for para imprimir los números del 1 al 10.',
    difficulty: 'Intermedio',
    mode: 'practice',
    starter_code: '-- Escribí el bucle for aquí\n',
    solution: 'for i = 1, 10 do\n  print(i)\nend',
    expected_output: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    hints: ['Sintaxis: for i = 1, 10 do ... end', 'Usá print(i) dentro del bucle'],
    test_cases: [
      {
        description: 'Usa un bucle for',
        check: (code) => /for\s+\w+\s*=/.test(code),
      },
      {
        description: 'Tiene print dentro del bucle',
        check: (code) => /for[\s\S]*print[\s\S]*end/.test(code),
      },
    ],
  },
  {
    id: 26,
    title: '26. For con suma acumulada',
    theory: `📚 TEORÍA: Acumuladores

Un patrón común es sumar valores en un bucle:

Ejemplo - Sumar del 1 al 10:
  local suma = 0

  for i = 1, 10 do
    suma = suma + i
  end

  print("Suma total:", suma)  -- 55

El patrón es:
1. Crear variable acumuladora = 0
2. En cada iteración: acumulador = acumulador + valor
3. Al final, tenés el total`,
    description: 'Calculá la suma de los números del 1 al 100 usando un for. Mostrá el resultado.',
    difficulty: 'Intermedio',
    mode: 'practice',
    starter_code:
      '-- Creá la variable suma\nlocal suma = 0\n\n-- Usá el bucle for\n\n-- Mostrá el resultado\n',
    solution:
      'local suma = 0\n\nfor i = 1, 100 do\n  suma = suma + i\nend\n\nprint("Suma del 1 al 100:", suma)',
    expected_output: ['Suma del 1 al 100: 5050'],
    hints: ['Empezá con suma = 0', 'En el bucle: suma = suma + i'],
    test_cases: [
      {
        description: 'Crea una variable acumuladora en 0',
        check: (code) => /local\s+\w+\s*=\s*0/.test(code),
      },
      {
        description: 'Usa un bucle for',
        check: (code) => /for\s+\w+\s*=/.test(code),
      },
      {
        description: 'Acumula valores (variable = variable + algo)',
        check: (code) => /\w+\s*=\s*\w+\s*\+/.test(code),
      },
    ],
  },
  {
    id: 27,
    title: '27. While - Bucle con condición',
    theory: `📚 TEORÍA: Bucle WHILE

While repite mientras una condición sea verdadera:

Sintaxis:
  while condicion do
    -- código a repetir
  end

⚠️ IMPORTANTE: Asegurate de que la condición eventualmente sea falsa,
   sino el bucle será infinito.

Ejemplo:
  local contador = 1

  while contador <= 5 do
    print(contador)
    contador = contador + 1
  end

¡No olvides modificar la variable de control!`,
    description: 'Creá una variable e incrementala en un bucle while hasta un límite.',
    difficulty: 'Intermedio',
    mode: 'practice',
    starter_code: '-- Creá una variable numérica\n\n-- Escribí el bucle while\n',
    solution:
      'local contador = 1\n\nwhile contador <= 5 do\n  print(contador)\n  contador = contador + 1\nend',
    expected_output: ['1', '2', '3', '4', '5'],
    hints: ['Sintaxis: while condicion do ... end', 'Incrementá la variable dentro del bucle'],
    test_cases: [
      {
        description: 'Usa while',
        check: (code) => code.includes('while') && code.includes('do'),
      },
      {
        description: 'Incrementa una variable',
        check: (code) => /\w+\s*=\s*\w+\s*\+/.test(code),
      },
    ],
  },
  {
    id: 28,
    title: '28. Repeat-Until',
    theory: `📚 TEORÍA: Bucle REPEAT-UNTIL

Repeat ejecuta el código AL MENOS UNA VEZ, luego verifica la condición:

Sintaxis:
  repeat
    -- código a repetir
  until condicion

Diferencia con while:
  • while verifica ANTES de ejecutar
  • repeat verifica DESPUÉS de ejecutar

Ejemplo:
  local numero = 1

  repeat
    print(numero)
    numero = numero + 1
  until numero > 5

  -- Output: 1, 2, 3, 4, 5`,
    description: 'Usá repeat-until para contar del 1 al 5.',
    difficulty: 'Intermedio',
    mode: 'practice',
    starter_code: '-- Creá el número\nlocal numero = 1\n\n-- Escribí el repeat-until\n',
    solution:
      'local numero = 1\n\nrepeat\n  print(numero)\n  numero = numero + 1\nuntil numero > 5',
    expected_output: ['1', '2', '3', '4', '5'],
    hints: ['Sintaxis: repeat ... until condicion', 'La condición va al final'],
    test_cases: [
      {
        description: 'Usa repeat y until',
        check: (code) => code.includes('repeat') && code.includes('until'),
      },
      {
        description: 'Incrementa una variable',
        check: (code) => /\w+\s*=\s*\w+\s*\+/.test(code),
      },
    ],
  },

  // TABLAS/ARRAYS (17-20)
  {
    id: 29,
    title: '29. Tablas - Arrays básicos',
    theory: `📚 TEORÍA: Tablas (Arrays)

Las tablas son colecciones de valores. En Luau son súper versátiles.

Sintaxis:
  local miTabla = {valor1, valor2, valor3}

⚠️ IMPORTANTE: Los índices empiezan en 1, no en 0.

Ejemplos:
  local frutas = {"manzana", "banana", "naranja"}

  print(frutas[1])  -- "manzana"
  print(frutas[2])  -- "banana"
  print(frutas[3])  -- "naranja"

  -- Longitud de la tabla
  print(#frutas)  -- 3`,
    description: 'Creá una tabla con 5 colores. Imprimí el primero, tercero y último color.',
    difficulty: 'Intermedio',
    mode: 'practice',
    starter_code:
      '-- Creá la tabla de colores\nlocal colores = {}\n\n-- Imprimí los colores pedidos\n',
    solution:
      'local colores = {"rojo", "azul", "verde", "amarillo", "negro"}\n\nprint("Primer color:", colores[1])\nprint("Tercer color:", colores[3])\nprint("Último color:", colores[#colores])',
    expected_output: ['Primer color: rojo', 'Tercer color: verde', 'Último color: negro'],
    hints: ['Los índices empiezan en 1', 'Usá #tabla para la longitud'],
    test_cases: [
      {
        description: 'Crea una tabla con valores',
        check: (code) => /=\s*{[^}]+}/.test(code),
      },
      {
        description: 'Accede a elementos con índices',
        check: (code) => /\[\d+\]/.test(code),
      },
      {
        description: 'Usa # para la longitud',
        check: (code) => code.includes('#'),
      },
    ],
  },
  {
    id: 30,
    title: '30. Modificar tablas',
    theory: `📚 TEORÍA: Modificar Tablas

Podés cambiar valores existentes o agregar nuevos:

Cambiar un valor:
  local numeros = {10, 20, 30}
  numeros[2] = 99
  -- Ahora es: {10, 99, 30}

Agregar al final:
  table.insert(tabla, valor)

Agregar en posición específica:
  table.insert(tabla, posicion, valor)

Eliminar:
  table.remove(tabla, posicion)

Ejemplo:
  local lista = {1, 2, 3}
  table.insert(lista, 4)  -- {1, 2, 3, 4}
  table.remove(lista, 2)  -- {1, 3, 4}`,
    description:
      'Creá tabla con 3 números. Agregá 2 más con table.insert. Mostrá la tabla completa.',
    difficulty: 'Intermedio',
    mode: 'practice',
    starter_code:
      '-- Creá la tabla\nlocal numeros = {10, 20, 30}\n\n-- Agregá dos números más\n\n-- Mostrá todos los números\n',
    solution:
      'local numeros = {10, 20, 30}\n\ntable.insert(numeros, 40)\ntable.insert(numeros, 50)\n\nfor i = 1, #numeros do\n  print("Posición", i, ":", numeros[i])\nend',
    expected_output: [
      'Posición 1 : 10',
      'Posición 2 : 20',
      'Posición 3 : 30',
      'Posición 4 : 40',
      'Posición 5 : 50',
    ],
    hints: ['Usá table.insert(tabla, valor)', 'Recorré con for para imprimir todo'],
    test_cases: [
      {
        description: 'Usa table.insert',
        check: (code) => code.includes('table.insert'),
      },
      {
        description: 'Usa un bucle for',
        check: (code) => /for\s+\w+\s*=/.test(code),
      },
    ],
  },
  {
    id: 31,
    title: '31. Iterar con ipairs',
    theory: `📚 TEORÍA: Ipairs - Iterar arrays

ipairs() recorre una tabla secuencial (array):

Sintaxis:
  for indice, valor in ipairs(tabla) do
    -- código
  end

Ejemplo:
  local frutas = {"manzana", "banana", "naranja"}

  for i, fruta in ipairs(frutas) do
    print(i, fruta)
  end

  -- Output:
  -- 1 manzana
  -- 2 banana
  -- 3 naranja

ipairs() devuelve el índice Y el valor en cada iteración.`,
    description: 'Creá tabla con 5 nombres. Usá ipairs para imprimir cada uno con su posición.',
    difficulty: 'Avanzado',
    mode: 'practice',
    starter_code: '-- Creá la tabla\nlocal nombres = {}\n\n-- Iterá con ipairs\n',
    solution:
      'local nombres = {"Alex", "Maria", "Juan", "Sofia", "Pedro"}\n\nfor i, nombre in ipairs(nombres) do\n  print(i .. ".", nombre)\nend',
    expected_output: ['1. Alex', '2. Maria', '3. Juan', '4. Sofia', '5. Pedro'],
    hints: ['Sintaxis: for i, valor in ipairs(tabla) do', 'i es el índice, valor es el elemento'],
    test_cases: [
      {
        description: 'Usa ipairs',
        check: (code) => code.includes('ipairs'),
      },
      {
        description: 'Tiene un bucle for con ipairs',
        check: (code) => /for\s+\w+\s*,\s*\w+\s+in\s+ipairs/.test(code),
      },
    ],
  },
  {
    id: 32,
    title: '32. Tablas como diccionarios',
    theory: `📚 TEORÍA: Tablas como Diccionarios (Hash Maps)

Las tablas también pueden usar claves personalizadas:

Sintaxis:
  local tabla = {
    clave1 = valor1,
    clave2 = valor2
  }

Acceso:
  tabla.clave  o  tabla["clave"]

Ejemplo:
  local jugador = {
    nombre = "Alex",
    vida = 100,
    nivel = 5
  }

  print(jugador.nombre)  -- "Alex"
  print(jugador["vida"])  -- 100

  -- Modificar
  jugador.vida = 80

  -- Agregar nuevo
  jugador.puntos = 500`,
    description:
      'Creá una tabla con claves personalizadas (ej: nombre, edad, ciudad). Imprimí sus valores.',
    difficulty: 'Avanzado',
    mode: 'practice',
    starter_code:
      '-- Creá una tabla con claves personalizadas\nlocal miTabla = {\n  \n}\n\n-- Mostrá la información\n',
    solution:
      'local personaje = {\n  nombre = "Alex",\n  vida = 100,\n  nivel = 5\n}\n\nprint("Nombre:", personaje.nombre)\nprint("Vida:", personaje.vida)\nprint("Nivel:", personaje.nivel)',
    expected_output: ['Nombre: Alex', 'Vida: 100', 'Nivel: 5'],
    hints: ['Sintaxis: clave = valor', 'Accedé con: tabla.clave'],
    test_cases: [
      {
        description: 'Crea una tabla con claves personalizadas',
        check: (code) => /\w+\s*=\s*\{[\s\S]*\w+\s*=/.test(code),
      },
      {
        description: 'Accede a propiedades con punto',
        check: (code) => /\w+\.\w+/.test(code),
      },
    ],
  },

  // FUNCIONES (21-24)
  {
    id: 33,
    title: '33. Funciones básicas',
    theory: `📚 TEORÍA: Funciones

Las funciones son bloques de código reutilizables:

Sintaxis:
  local function nombreFuncion()
    -- código
  end

Llamar la función:
  nombreFuncion()

Ejemplo:
  local function saludar()
    print("¡Hola!")
  end

  saludar()  -- ¡Hola!
  saludar()  -- ¡Hola!

Las funciones te ahorran escribir el mismo código varias veces.`,
    description: 'Creá una función que imprima un mensaje. Llamala 3 veces.',
    difficulty: 'Avanzado',
    mode: 'practice',
    starter_code: '-- Define una función sin parámetros\n\n-- Llamala 3 veces\n',
    solution:
      'local function mostrarMensaje()\n  print("Bienvenido a Roblox")\nend\n\nmostrarMensaje()\nmostrarMensaje()\nmostrarMensaje()',
    expected_output: ['Bienvenido a Roblox', 'Bienvenido a Roblox', 'Bienvenido a Roblox'],
    hints: ['Sintaxis: local function nombre() ... end', 'Llamá con: nombre()'],
    test_cases: [
      {
        description: 'Define una función',
        check: (code) => /function\s+\w+\s*\(\s*\)/.test(code),
      },
      {
        description: 'Llama a una función al menos 3 veces',
        check: (code) => {
          const funcName = (code.match(/function\s+(\w+)\s*\(/) || [])[1];
          if (!funcName) return false;
          const regex = new RegExp(`${funcName}\\s*\\(\\s*\\)`, 'g');
          const matches = code.match(regex);
          return matches ? matches.length >= 3 : false;
        },
      },
    ],
  },
  {
    id: 34,
    title: '34. Funciones con parámetros',
    theory: `📚 TEORÍA: Parámetros

Los parámetros permiten pasar información a las funciones:

Sintaxis:
  local function nombre(parametro1, parametro2)
    -- usar parametros
  end

Ejemplo:
  local function saludar(nombre)
    print("Hola, " .. nombre .. "!")
  end

  saludar("Alex")   -- Hola, Alex!
  saludar("Maria")  -- Hola, Maria!

Múltiples parámetros:
  local function sumar(a, b)
    print(a + b)
  end

  sumar(5, 3)  -- 8`,
    description: 'Creá una función con 2 parámetros que los imprima. Llamala con valores.',
    difficulty: 'Avanzado',
    mode: 'practice',
    starter_code: '-- Define una función con 2 parámetros\n\n-- Llamala con valores\n',
    solution:
      'local function presentar(nombre, edad)\n  print("Me llamo " .. nombre .. " y tengo " .. edad .. " años")\nend\n\npresentar("Alex", 15)',
    expected_output: ['Me llamo Alex y tengo 15 años'],
    hints: ['Sintaxis: function nombre(param1, param2)', 'Usá los parámetros dentro de la función'],
    test_cases: [
      {
        description: 'Define función con 2 parámetros',
        check: (code) => /function\s+\w+\s*\(\s*\w+\s*,\s*\w+\s*\)/.test(code),
      },
      {
        description: 'Llama a una función con argumentos',
        check: (code) => /\w+\s*\([^)]+,[^)]+\)/.test(code),
      },
    ],
  },
  {
    id: 35,
    title: '35. Funciones con return',
    theory: `📚 TEORÍA: Return - Devolver valores

Return hace que la función devuelva un resultado:

Sintaxis:
  local function nombre()
    return valor
  end

Ejemplo:
  local function sumar(a, b)
    return a + b
  end

  local resultado = sumar(5, 3)
  print(resultado)  -- 8

Return múltiple:
  local function obtenerDatos()
    return "Alex", 15
  end

  local nombre, edad = obtenerDatos()
  print(nombre)  -- Alex
  print(edad)    -- 15`,
    description:
      'Creá una función que reciba dos números y devuelva una operación matemática. Usá return.',
    difficulty: 'Avanzado',
    mode: 'practice',
    starter_code: '-- Define una función con return\n\n-- Usá la función e imprimí el resultado\n',
    solution:
      'local function multiplicar(a, b)\n  return a * b\nend\n\nlocal resultado = multiplicar(7, 8)\nprint("7 x 8 =", resultado)',
    expected_output: ['7 x 8 = 56'],
    hints: ['Usá return para devolver el resultado', 'Guardá el resultado en una variable'],
    test_cases: [
      {
        description: 'Define una función',
        check: (code) => /function\s+\w+\s*\([^)]*\)/.test(code),
      },
      {
        description: 'Usa return',
        check: (code) => code.includes('return'),
      },
      {
        description: 'Llama a una función',
        check: (code) => /\w+\s*\([^)]*\)/.test(code) && code.includes('local'),
      },
    ],
  },
  {
    id: 36,
    title: '36. Scope de variables',
    theory: `📚 TEORÍA: Scope (Alcance)

El scope determina dónde una variable es visible:

Variables locales:
  • Existen solo dentro de su bloque
  • Creadas con "local"

Variables globales:
  • Existen en todo el programa
  • Creadas sin "local" (⚠️ evitalas)

Ejemplo:
  local x = 10  -- Global al script

  local function prueba()
    local y = 5  -- Solo existe en prueba()
    print(x)  -- Puede ver x
    print(y)  -- Puede ver y
  end

  prueba()
  print(x)  -- Funciona
  print(y)  -- ERROR: y no existe aquí

Siempre usá "local" para evitar problemas.`,
    description:
      'Creá una variable en 0. Creá una función que la incremente. Llamala varias veces y mostrá el valor.',
    difficulty: 'Avanzado',
    mode: 'practice',
    starter_code:
      '-- Variable global al script\nlocal miVariable = 0\n\n-- Define una función que la modifique\n\n-- Llamala varias veces y mostrá el valor\n',
    solution:
      'local puntos = 0\n\nlocal function ganarPuntos()\n  puntos = puntos + 10\nend\n\nganarPuntos()\nganarPuntos()\nganarPuntos()\n\nprint("Puntos totales:", puntos)',
    expected_output: ['Puntos totales: 30'],
    hints: [
      'La función puede modificar variables externas',
      'No uses local al modificar la variable dentro de la función',
    ],
    test_cases: [
      {
        description: 'Define una variable inicial',
        check: (code) => /local\s+\w+\s*=\s*\d+/.test(code),
      },
      {
        description: 'Define una función',
        check: (code) => /function\s+\w+/.test(code),
      },
      {
        description: 'Modifica una variable dentro de la función',
        check: (code) => {
          const varName = (code.match(/local\s+(\w+)\s*=\s*\d+/) || [])[1];
          if (!varName) return /\w+\s*=\s*\w+\s*[+\-*/]/.test(code);
          const regex = new RegExp(`${varName}\\s*=\\s*${varName}\\s*[+\\-*/]`);
          return regex.test(code);
        },
      },
    ],
  },

  // DESAFÍOS FINALES (25+)
  {
    id: 37,
    title: '37. Proyecto: Contador de clicks',
    theory: `📚 PROYECTO: Sistema de Clicks

Vamos a crear un sistema simple de contador:

Componentes necesarios:
  1. Variable para guardar clicks
  2. Función para agregar un click
  3. Función para mostrar el total
  4. Función para resetear

Este patrón es común en juegos (contar monedas, puntos, etc.)`,
    description:
      'Creá un sistema de contador: una variable en 0, 3 funciones (agregar, mostrar, resetear). Probalas.',
    difficulty: 'Avanzado',
    mode: 'practice',
    starter_code:
      '-- Variable contador\nlocal contador = 0\n\n-- 3 funciones: agregar, mostrar, resetear\n\n-- Probá el sistema\n',
    solution:
      'local clicks = 0\n\nlocal function agregarClick()\n  clicks = clicks + 1\n  print("Click #" .. clicks)\nend\n\nlocal function mostrarClicks()\n  print("Total de clicks:", clicks)\nend\n\nlocal function resetear()\n  clicks = 0\n  print("Clicks reseteados")\nend\n\n-- Probar\nagregarClick()\nagregarClick()\nagregarClick()\nmostrarClicks()\nresetear()\nmostrarClicks()',
    expected_output: [
      'Click #1',
      'Click #2',
      'Click #3',
      'Total de clicks: 3',
      'Clicks reseteados',
      'Total de clicks: 0',
    ],
    hints: ['Creá 3 funciones separadas', 'Todas modifican/leen la misma variable'],
    test_cases: [
      {
        description: 'Define una variable inicial',
        check: (code) => /local\s+\w+\s*=\s*0/.test(code),
      },
      {
        description: 'Define al menos 3 funciones',
        check: (code) => (code.match(/function\s+\w+/g) || []).length >= 3,
      },
      {
        description: 'Llama a funciones',
        check: (code) => {
          const afterLastFunc = code.split('function').pop() || '';
          return (afterLastFunc.match(/\w+\s*\(\s*\)/g) || []).length >= 2;
        },
      },
    ],
  },
];

interface LuauEditorProps {
  theme: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
  exercises?: Exercise[];
}

export default function LuauEditor({ theme, exercises }: LuauEditorProps) {
  // Usar ejercicios pasados como prop o los hardcodeados como fallback
  const ACTIVE_EXERCISES = exercises ?? EXERCISES;

  // Guard: si no hay ejercicios, mostrar mensaje
  if (ACTIVE_EXERCISES.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>No hay ejercicios disponibles</p>
      </div>
    );
  }

  // Safe first exercise - guaranteed to exist after length check
  const firstExercise = ACTIVE_EXERCISES[0] as Exercise;

  const { width, height } = useWindowSize();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [code, setCode] = useState(firstExercise.starter_code);
  const [output, setOutput] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [testResults, setTestResults] = useState<boolean[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fengariLoaded, setFengariLoaded] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [luaEngine, setLuaEngine] = useState<any>(null);

  // Safe exercise access - clamp index to valid range
  const safeIndex = Math.min(currentExerciseIndex, ACTIVE_EXERCISES.length - 1);
  const exercise = ACTIVE_EXERCISES[safeIndex] as Exercise;

  // Cargar Fengari cuando el componente se monta
  useEffect(() => {
    if (typeof window !== 'undefined' && !fengariLoaded) {
      import('fengari-web')
        .then((fengari) => {
          setLuaEngine(fengari);
          setFengariLoaded(true);
          console.log('✅ Fengari cargado correctamente');
        })
        .catch((err) => {
          console.error('❌ Error cargando Fengari:', err);
        });
    }
  }, [fengariLoaded]);

  useEffect(() => {
    setCode(exercise.starter_code);
    setOutput([]);
    setShowHints(false);
    setShowSolution(false);
    setTestResults([]);
    setShowConfetti(false);

    // Detener voz si está hablando al cambiar de ejercicio
    if (isSpeaking && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [currentExerciseIndex, exercise.starter_code, isSpeaking]);

  const handleSpeak = () => {
    console.log('handleSpeak llamado, isSpeaking:', isSpeaking);

    // Verificar que estamos en el cliente y que speechSynthesis está disponible
    if (typeof window === 'undefined') {
      console.log('window no está definido');
      return;
    }

    if (!window.speechSynthesis) {
      console.log('speechSynthesis no está disponible');
      alert('Tu navegador no soporta text-to-speech. Probá con Chrome o Edge.');
      return;
    }

    if (isSpeaking) {
      // Si está hablando, detener
      console.log('Deteniendo speech...');
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // Empezar a hablar
      console.log('Iniciando speech...');
      console.log('Texto a leer:', exercise.theory.substring(0, 50) + '...');

      const utterance = new SpeechSynthesisUtterance(exercise.theory);
      utterance.lang = 'es-ES'; // Español
      utterance.rate = 0.9; // Velocidad (0.1 a 10)
      utterance.pitch = 1; // Tono (0 a 2)
      utterance.volume = 1; // Volumen (0 a 1)

      utterance.onstart = () => {
        console.log('Speech empezó');
      };

      utterance.onend = () => {
        console.log('Speech terminó');
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.log('Speech error:', event);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      console.log('setIsSpeaking(true) llamado');
    }
  };

  const handleRunCode = () => {
    const newOutput: string[] = [];

    try {
      // USAR FENGARI PARA EJECUTAR CÓDIGO LUA REAL
      if (luaEngine && fengariLoaded && typeof window !== 'undefined') {
        try {
          // Capturar print() usando fengari-interop
          const capturedOutput: string[] = [];

          // Sobrescribir console.log temporalmente para capturar output
          const originalLog = console.log;
          console.log = (...args: any[]) => {
            capturedOutput.push(args.map(String).join('\t'));
          };

          // Ejecutar el código Lua
          luaEngine.load(`
            ${code}
          `)();

          // Restaurar console.log
          console.log = originalLog;

          if (capturedOutput.length > 0) {
            newOutput.push(...capturedOutput);
          }
        } catch (luaError: any) {
          newOutput.push('❌ Error en el código:');
          newOutput.push(luaError.message || String(luaError));
        }
      } else {
        // FALLBACK: Simular ejecución si Fengari no está cargado
        const lines = code.split('\n');

        for (let line of lines) {
          // Capturar print con múltiples argumentos
          const printMatch = line.match(/print\s*\((.*)\)/);
          if (printMatch && printMatch[1] !== undefined) {
            const args = printMatch[1];
            // Evaluar strings simples y números
            let output = args.replace(/["']/g, '').replace(/\.\./g, ' ').trim();

            // Intentar evaluar expresiones matemáticas simples
            try {
              if (/^\d+\s*[\+\-\*\/]\s*\d+$/.test(args)) {
                output = String(eval(args));
              }
            } catch (e) {
              // Ignorar errores de eval
            }

            newOutput.push(output);
          }
        }
      }

      // Detectar si usa APIs de Roblox que no están disponibles en el entorno web
      const usesRobloxAPIs = code.match(
        /(script\.Parent|workspace\.|Humanoid|PointLight|BrickColor|Touched|Connect|FindFirstChild)/,
      );

      if (usesRobloxAPIs && newOutput.length === 0) {
        newOutput.push('⚠️ Este código usa APIs de Roblox Studio');
        newOutput.push('Copialo y ejecútalo en Roblox Studio para ver el resultado real.');
        newOutput.push('Los tests verificarán si está bien escrito ✅');
      }

      // NOTA: Las simulaciones por ID fueron eliminadas para evitar conflictos
      // entre diferentes semanas que reúsan los mismos IDs.

      // Si no hay output, mostrar mensaje neutro
      if (newOutput.length === 0) {
        newOutput.push('✓ Código ejecutado');
        newOutput.push('💡 Tip: Usá print() para ver resultados');
      }
    } catch (error) {
      // NUNCA mostrar error - siempre ejecutar
      newOutput.push('✓ Código ejecutado');
      newOutput.push('💡 Tip: Usá print() para mostrar información');
    }

    setOutput(newOutput);

    // EJECUTAR TESTS AUTOMÁTICAMENTE después de mostrar el output
    setTimeout(() => {
      const results = exercise.test_cases.map((test) => test.check(code));
      setTestResults(results);

      const allPassed = results.every((r) => r);
      if (allPassed) {
        // ¡TODOS LOS TESTS PASARON! 🎉
        setCompletedExercises(new Set(Array.from(completedExercises).concat([exercise.id])));

        // Actualizar output con mensaje de éxito
        setOutput([
          '✅ ¡EXCELENTE! Todos los tests pasaron.',
          '🎉 Ejercicio completado correctamente.',
          '',
          ...newOutput,
        ]);

        // MOSTRAR CONFETI! 🎊
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000); // 5 segundos de confeti
      } else {
        // Algunos tests fallaron
        setOutput([
          '⚠️ Algunos tests no pasaron. Revisá los detalles abajo.',
          'Usá las pistas si necesitás ayuda.',
          '',
          ...newOutput,
        ]);
      }
    }, 300); // Delay de 300ms para que se vean los tests marcándose
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < ACTIVE_EXERCISES.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Básico':
        return theme.secondary;
      case 'Intermedio':
        return theme.accent;
      case 'Avanzado':
        return '#EF4444';
      default:
        return theme.primary;
    }
  };

  return (
    <div
      className="h-screen flex flex-col py-4 md:py-6 lg:py-8 px-2 md:px-4 lg:px-6 relative overflow-hidden"
      style={{ backgroundColor: theme.background, fontFamily: 'Nunito, sans-serif' }}
    >
      {/* CONFETI cuando completan ejercicio 🎉 */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      {/* Efectos de fondo */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: theme.primary }}
        />
        <div
          className="absolute bottom-20 right-10 w-80 h-80 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: theme.secondary, animationDelay: '1s' }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col h-full w-full">
        {/* Botones de navegación simples */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 bg-slate-800 hover:bg-slate-700 text-white border-2 border-slate-700 flex items-center gap-2"
          >
            ← Atrás
          </button>
          <button
            onClick={() => (window.location.href = '/roblox')}
            className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 bg-slate-800 hover:bg-slate-700 text-white border-2 border-slate-700 flex items-center gap-2"
          >
            🏠 Inicio
          </button>
        </div>

        {/* Layout unificado con teoría + editor */}
        <>
          <div className="mb-3 md:mb-4">
            <div className="bg-slate-900/80 backdrop-blur-md border-2 border-indigo-500/40 rounded-xl md:rounded-2xl p-3 md:p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 md:gap-4">
                  <h2 className="text-lg md:text-2xl font-black text-white">{exercise.title}</h2>
                  <span
                    className="inline-block px-2 md:px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: getDifficultyColor(exercise.difficulty) + '20',
                      color: getDifficultyColor(exercise.difficulty),
                      border: `2px solid ${getDifficultyColor(exercise.difficulty)}60`,
                    }}
                  >
                    {exercise.difficulty}
                  </span>
                </div>
                {completedExercises.has(exercise.id) && (
                  <div className="text-2xl md:text-4xl">✅</div>
                )}
              </div>
            </div>
          </div>
          {/* EJERCICIOS CON CÓDIGO (13+): Layout completo con editor */}
          {exercise.mode === 'quiz' && exercise.quiz ? (
            // LAYOUT DE QUIZ - DISABLED: QuizInteractivo component removed
            <div className="max-w-4xl mx-auto mb-4 p-6">
              <div className="bg-yellow-100 border-2 border-yellow-500 p-4 rounded">
                <p className="text-yellow-800">Quiz component temporalmente deshabilitado</p>
                <button
                  onClick={handleNextExercise}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Continuar
                </button>
              </div>
            </div>
          ) : (
            // LAYOUT NORMAL CON EDITOR
            <div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 mb-4"
              style={{
                height: 'auto',
                minHeight: 'calc(100vh - 400px)',
                maxHeight: 'calc(100vh - 320px)',
              }}
            >
              {/* COLUMNA 1: TEORÍA - Responsive */}
              <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-md border-2 border-indigo-400/60 rounded-xl md:rounded-2xl overflow-hidden flex flex-col h-[400px] md:h-auto">
                <div className="flex items-center justify-between p-3 md:p-4 border-b-2 border-indigo-400/30">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="text-xl md:text-2xl">📚</div>
                    <h3 className="text-base md:text-lg font-black text-white">TEORÍA</h3>
                  </div>
                  <button
                    onClick={handleSpeak}
                    className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm rounded-lg font-semibold transition-all duration-300 hover:scale-105 border-2 flex items-center gap-1 md:gap-2"
                    style={{
                      backgroundColor: isSpeaking ? '#EF444420' : theme.primary + '20',
                      borderColor: isSpeaking ? '#EF444460' : theme.primary + '60',
                      color: isSpeaking ? '#EF4444' : theme.primary,
                    }}
                  >
                    {isSpeaking ? '⏸️' : '🔊'}
                    <span className="hidden sm:inline">{isSpeaking ? 'Pausar' : 'Escuchar'}</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 md:p-4">
                  <div
                    className="text-slate-100 text-xs md:text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: marked(exercise.theory) as string }}
                  />
                </div>
              </div>

              {/* COLUMNA 2: PRÁCTICA - Responsive */}
              <div className="bg-slate-900/80 backdrop-blur-md border-2 border-green-500/40 rounded-xl md:rounded-2xl overflow-hidden flex flex-col h-[400px] md:h-auto">
                <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border-b-2 border-green-500/30">
                  <div className="text-xl md:text-2xl">💻</div>
                  <h3 className="text-base md:text-lg font-black text-white">PRÁCTICA</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-bold text-white mb-2">📝 Tu desafío:</h4>
                    <p className="text-slate-200 text-sm leading-relaxed">{exercise.description}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="px-3 py-1.5 text-sm rounded-lg font-semibold transition-all duration-300 hover:scale-105 border-2"
                      style={{
                        backgroundColor: theme.accent + '20',
                        borderColor: theme.accent + '60',
                        color: theme.accent,
                      }}
                    >
                      {showHints ? '🙈' : '💡'} Pistas
                    </button>

                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="px-3 py-1.5 text-sm rounded-lg font-semibold transition-all duration-300 hover:scale-105 border-2"
                      style={{
                        backgroundColor: '#EF444420',
                        borderColor: '#EF444460',
                        color: '#EF4444',
                      }}
                    >
                      {showSolution ? '🙈' : '👀'} Solución
                    </button>
                  </div>

                  {/* Hints */}
                  {showHints && (
                    <div
                      className="p-3 rounded-xl border-2"
                      style={{
                        backgroundColor: theme.accent + '10',
                        borderColor: theme.accent + '40',
                      }}
                    >
                      <h4 className="font-bold text-white mb-2 text-sm">💡 Pistas:</h4>
                      <ul className="space-y-1.5">
                        {exercise.hints.map((hint, idx) => (
                          <li key={idx} className="text-slate-300 flex gap-2 text-xs">
                            <span style={{ color: theme.accent }}>•</span>
                            <span>{hint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Solution */}
                  {showSolution && (
                    <div className="p-3 rounded-xl border-2 bg-slate-950/60 border-red-500/40">
                      <h4 className="font-bold text-white mb-2 text-sm">👀 Solución:</h4>
                      <pre className="text-green-300 text-xs overflow-x-auto font-mono">
                        <code>{exercise.solution}</code>
                      </pre>
                    </div>
                  )}

                  {/* Test cases */}
                  <div>
                    <h4 className="text-sm font-bold text-white mb-3">✓ Tests de Verificación</h4>
                    <div className="space-y-2">
                      {exercise.test_cases.map((test, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-lg transition-all duration-300"
                          style={{
                            backgroundColor:
                              testResults.length > 0
                                ? testResults[idx]
                                  ? theme.secondary + '20'
                                  : '#EF444420'
                                : theme.background,
                          }}
                        >
                          <span className="text-xl">
                            {testResults.length > 0 ? (testResults[idx] ? '✅' : '❌') : '⚪'}
                          </span>
                          <span className="text-slate-300 text-xs">{test.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMNA 3: EDITOR + CONSOLA - Responsive */}
              <div className="flex flex-col gap-3 md:gap-4 h-[600px] md:h-auto">
                {/* Code editor */}
                <div
                  className="bg-slate-900/80 backdrop-blur-md border-2 border-indigo-500/40 rounded-xl md:rounded-2xl overflow-hidden flex flex-col"
                  style={{ height: '60%' }}
                >
                  <div className="flex items-center justify-between p-2 md:p-3 border-b-2 border-slate-700">
                    <h3 className="text-sm md:text-base font-black text-white">📝 Tu Código</h3>
                    <button
                      onClick={handleRunCode}
                      className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-bold text-xs md:text-sm transition-all duration-300 hover:scale-110 active:scale-95 text-white shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                      }}
                    >
                      ▶ Ejecutar
                    </button>
                  </div>

                  <Editor
                    height="100%"
                    defaultLanguage="lua"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                      fontSize: 12,
                      minimap: { enabled: false },
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on',
                    }}
                  />
                </div>

                {/* Output console */}
                <div
                  className="bg-slate-950/90 backdrop-blur-md border-2 border-slate-700 rounded-xl md:rounded-2xl overflow-hidden flex flex-col"
                  style={{ height: '40%' }}
                >
                  <div className="p-2 md:p-3 border-b-2 border-slate-700">
                    <h3 className="text-sm md:text-base font-black text-white">📺 Consola</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 md:p-3">
                    <div className="bg-slate-900 rounded-lg p-2 md:p-3 font-mono text-xs md:text-sm h-full">
                      {output.length === 0 ? (
                        <p className="text-slate-500 italic">
                          Ejecutá tu código para ver el output...
                        </p>
                      ) : (
                        output.map((line, idx) => (
                          <div key={idx} className="text-green-300 mb-1">
                            {line}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>

        {/* Navigation buttons - Fijos abajo */}
        <div className="flex justify-between items-center gap-2 md:gap-4 mt-4 flex-shrink-0">
          <button
            onClick={handlePrevExercise}
            disabled={currentExerciseIndex === 0}
            className="px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-base transition-all duration-300 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 bg-slate-800 hover:bg-slate-700 text-white border-2 border-slate-700"
          >
            ← Anterior
          </button>

          <div className="text-center">
            <p className="text-slate-400 text-xs md:text-sm mb-1">Ejercicio</p>
            <p className="text-white text-lg md:text-2xl font-black">
              {currentExerciseIndex + 1} / {ACTIVE_EXERCISES.length}
            </p>
          </div>

          <button
            onClick={handleNextExercise}
            disabled={currentExerciseIndex === ACTIVE_EXERCISES.length - 1}
            className="px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-base transition-all duration-300 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 text-white"
            style={{
              background:
                currentExerciseIndex === ACTIVE_EXERCISES.length - 1
                  ? '#475569'
                  : `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            }}
          >
            Siguiente →
          </button>
        </div>

        {/* Completion message - Responsive */}
        {completedExercises.size === ACTIVE_EXERCISES.length && (
          <div
            className="mt-6 md:mt-8 p-4 md:p-8 text-center rounded-2xl md:rounded-3xl border-2 animate-fadeIn"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}20, ${theme.secondary}20)`,
              borderColor: theme.secondary + '60',
            }}
          >
            <div className="text-4xl md:text-6xl mb-3 md:mb-4">🎉</div>
            <h2 className="text-xl md:text-3xl font-black text-white mb-2 md:mb-3">
              ¡Felicitaciones! Completaste todos los ejercicios
            </h2>
            <p className="text-sm md:text-xl text-slate-300">
              Ya dominás los fundamentos de Luau para Roblox Studio
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
