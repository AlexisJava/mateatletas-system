/**
 * Script para convertir HTML a PDF usando Puppeteer (renderiza CSS completo)
 *
 * Instalación:
 * npm install puppeteer
 *
 * Uso:
 * 1. Pegá tu HTML en la variable htmlContent
 * 2. Ejecutar: npx tsx scripts/html-to-pdf-puppeteer.ts
 * 3. El PDF se genera en: pdfs-output/Colonia_Verano_2025_Directiva.pdf
 */

import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════════
// TU HTML COMPLETO ACÁ
// ═══════════════════════════════════════════════════════
const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Colonia de Verano Mateatletas 2025 - Directiva Docentes</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background: white;
            padding: 0;
            margin: 0;
        }

        .container {
            width: 100%;
            max-width: 100%;
            margin: 0;
            background: white;
            border-radius: 0;
            box-shadow: none;
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 50px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }

        .header-content {
            position: relative;
            z-index: 1;
        }

        .header h1 {
            font-size: 42px;
            margin-bottom: 10px;
            font-weight: 800;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .header .subtitle {
            font-size: 20px;
            opacity: 0.95;
            font-weight: 300;
        }

        .content {
            padding: 30px;
        }

        @page {
            size: A4;
            margin: 0;
        }

        .alert-box {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(245, 87, 108, 0.3);
        }

        .alert-box h3 {
            font-size: 22px;
            margin-bottom: 15px;
            font-weight: 700;
        }

        .alert-box ul {
            list-style: none;
            padding: 0;
        }

        .alert-box li {
            padding: 8px 0;
            padding-left: 25px;
            position: relative;
        }

        .alert-box li::before {
            content: '✓';
            position: absolute;
            left: 0;
            font-weight: bold;
            font-size: 18px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin: 20px 0;
        }

        .info-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
        }

        .info-card h4 {
            font-size: 36px;
            margin-bottom: 8px;
            font-weight: 800;
        }

        .info-card p {
            font-size: 14px;
            opacity: 0.95;
        }

        .section {
            margin-bottom: 40px;
        }

        .section-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 25px;
            color: #1e293b;
            padding-bottom: 12px;
            border-bottom: 3px solid #667eea;
            display: flex;
            align-items: center;
        }

        .section-title::before {
            content: '●';
            color: #667eea;
            font-size: 32px;
            margin-right: 15px;
        }

        .profesor-card {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            page-break-inside: avoid;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .profesor-header {
            display: flex;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f1f5f9;
        }

        .profesor-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            margin-right: 20px;
            box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
        }

        .profesor-info h3 {
            font-size: 24px;
            color: #1e293b;
            margin-bottom: 5px;
        }

        .profesor-info p {
            color: #64748b;
            font-size: 14px;
        }

        .curso {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 15px;
            margin-bottom: 12px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            page-break-inside: avoid;
        }

        .curso h4 {
            color: #1e293b;
            font-size: 18px;
            margin-bottom: 12px;
            font-weight: 600;
        }

        .curso-meta {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            margin-bottom: 10px;
        }

        .curso-meta span {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: white;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
            color: #475569;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .curso-meta span::before {
            font-size: 16px;
        }

        .edad-tag::before {
            content: '👥';
        }

        .horario-tag::before {
            content: '🕐';
        }

        .curso-desc {
            color: #64748b;
            font-size: 14px;
            line-height: 1.6;
        }

        .highlight-box {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: #78350f;
            padding: 25px;
            border-radius: 15px;
            margin: 30px 0;
            box-shadow: 0 10px 30px rgba(251, 191, 36, 0.3);
        }

        .highlight-box h3 {
            font-size: 20px;
            margin-bottom: 15px;
            font-weight: 700;
            color: #78350f;
        }

        .highlight-box ul {
            list-style: none;
            padding: 0;
        }

        .highlight-box li {
            padding: 10px 0;
            padding-left: 30px;
            position: relative;
            color: #78350f;
            font-weight: 500;
        }

        .highlight-box li::before {
            content: '⭐';
            position: absolute;
            left: 0;
            font-size: 18px;
        }

        .confirmation-box {
            background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin: 30px 0;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
            text-align: center;
        }

        .confirmation-box h3 {
            font-size: 24px;
            margin-bottom: 15px;
            font-weight: 700;
        }

        .confirmation-box .date {
            font-size: 42px;
            font-weight: 800;
            margin: 15px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .confirmation-box p {
            font-size: 16px;
            opacity: 0.95;
            line-height: 1.6;
        }

        .footer {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 30px 40px;
            text-align: center;
        }

        .footer p {
            margin: 5px 0;
            opacity: 0.9;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }

            .container {
                box-shadow: none;
            }

            .profesor-card {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <h1>🚀 Colonia de Verano 2025</h1>
                <p class="subtitle">Directiva para Docentes - Mateatletas</p>
            </div>
        </div>

        <div class="content">
            <div class="alert-box">
                <h3>📅 Información General</h3>
                <ul>
                    <li><strong>Inicio:</strong> 12 de enero de 2025</li>
                    <li><strong>Finalización:</strong> 2 de marzo de 2025</li>
                    <li><strong>Días laborales:</strong> Lunes a Jueves</li>
                    <li><strong>Días libres:</strong> Viernes, Sábado y Domingo</li>
                    <li><strong>Modalidad:</strong> Virtual sincrónico</li>
                    <li><strong>Duración de clases:</strong> 90 minutos</li>
                </ul>
            </div>

            <div class="info-grid">
                <div class="info-card">
                    <h4>10</h4>
                    <p>Cursos Totales</p>
                </div>
                <div class="info-card">
                    <h4>8</h4>
                    <p>Semanas</p>
                </div>
                <div class="info-card">
                    <h4>3</h4>
                    <p>Profesores</p>
                </div>
                <div class="info-card">
                    <h4>4</h4>
                    <p>Días Semanales</p>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Asignación de Cursos</h2>

                <div class="profesor-card">
                    <div class="profesor-header">
                        <div class="profesor-avatar">👩‍🏫</div>
                        <div class="profesor-info">
                            <h3>Profe Gimena</h3>
                            <p>Área: Matemática | 3 cursos asignados</p>
                        </div>
                    </div>

                    <div class="curso">
                        <h4>"Matemática con Juegos y Desafíos"</h4>
                        <div class="curso-meta">
                            <span class="edad-tag">8-9 años</span>
                            <span class="horario-tag">Lunes 10:30-12:00</span>
                        </div>
                        <p class="curso-desc">
                            Escape rooms matemáticos, batallas de matehéroes, construcción de imperio y desafíos finales. Enfoque lúdico y gamificado.
                        </p>
                    </div>

                    <div class="curso">
                        <h4>"Matemática en Acción: Proyectos Reales"</h4>
                        <div class="curso-meta">
                            <span class="edad-tag">10-12 años</span>
                            <span class="horario-tag">Martes 10:30-12:00</span>
                        </div>
                        <p class="curso-desc">
                            Proyectos prácticos: organizar fiestas, diseñar cuartos, planificar viajes. Matemática aplicada a situaciones reales.
                        </p>
                    </div>

                    <div class="curso">
                        <h4>"Superhéroes de los Números"</h4>
                        <div class="curso-meta">
                            <span class="edad-tag">6-7 años</span>
                            <span class="horario-tag">Miércoles 10:30-12:00</span>
                        </div>
                        <p class="curso-desc">
                            Introducción a las 4 operaciones básicas con narrativa de superhéroes. Suma, resta, multiplicación y división inicial.
                        </p>
                    </div>
                </div>

                <div class="profesor-card">
                    <div class="profesor-header">
                        <div class="profesor-avatar">👨‍🏫</div>
                        <div class="profesor-info">
                            <h3>Profe Fabricio</h3>
                            <p>Área: Programación y Matemática | 3 cursos asignados</p>
                        </div>
                    </div>

                    <div class="curso">
                        <h4>"Crea tu Videojuego con Scratch"</h4>
                        <div class="curso-meta">
                            <span class="edad-tag">8-9 años</span>
                            <span class="horario-tag">Lunes 10:30-12:00</span>
                        </div>
                        <p class="curso-desc">
                            Programación visual con Scratch. Movimiento, enemigos, puntos y vidas. Proyecto final: juego completo funcional.
                        </p>
                    </div>

                    <div class="curso">
                        <h4>"Robótica Virtual con Arduino y Tinkercad"</h4>
                        <div class="curso-meta">
                            <span class="edad-tag">10-12 años</span>
                            <span class="horario-tag">Martes 10:30-12:00</span>
                        </div>
                        <p class="curso-desc">
                            Circuitos virtuales, LEDs, botones, sensores y motores. Simulación de proyectos de robótica en Tinkercad.
                        </p>
                    </div>

                    <div class="curso">
                        <h4>"Desafío Olímpico Matemático"</h4>
                        <div class="curso-meta">
                            <span class="edad-tag">10-12 años</span>
                            <span class="horario-tag">Jueves 10:30-12:00</span>
                        </div>
                        <p class="curso-desc">
                            Problemas de lógica y razonamiento estilo OMA. Números creativos, geometría olímpica y simulacros de competencia.
                        </p>
                    </div>
                </div>

                <div class="profesor-card">
                    <div class="profesor-header">
                        <div class="profesor-avatar">👨‍💻</div>
                        <div class="profesor-info">
                            <h3>Alexis</h3>
                            <p>Área: Programación y Ciencias | 4 cursos asignados</p>
                        </div>
                    </div>

                    <div class="curso">
                        <h4>"Roblox Studio: Crea y Publica tu Juego"</h4>
                        <div class="curso-meta">
                            <span class="edad-tag">8-12 años</span>
                            <span class="horario-tag">Lunes 14:30-16:00</span>
                        </div>
                        <p class="curso-desc">
                            Diseño de mundos 3D, scripting en Lua, mecánicas de juego y publicación en la plataforma Roblox.
                        </p>
                    </div>

                    <div class="curso">
                        <h4>"Desarrollo de Videojuegos con Godot Engine"</h4>
                        <div class="curso-meta">
                            <span class="edad-tag">8-12 años</span>
                            <span class="horario-tag">Martes 14:30-16:00</span>
                        </div>
                        <p class="curso-desc">
                            Introducción a Godot: escenas, nodos, scripting básico y física. Creación de juego 2D completo.
                        </p>
                    </div>

                    <div class="curso">
                        <h4>"Científicos de Dinosaurios: Paleontología"</h4>
                        <div class="curso-meta">
                            <span class="edad-tag">8-12 años</span>
                            <span class="horario-tag">Miércoles 10:30-12:00</span>
                        </div>
                        <p class="curso-desc">
                            Fósiles, evolución, extinción y recreación de especies. Exploración completa de la era de los dinosaurios.
                        </p>
                    </div>

                    <div class="curso">
                        <h4>"Expedición Tierra: Misterios del Planeta"</h4>
                        <div class="curso-meta">
                            <span class="edad-tag">8-12 años</span>
                            <span class="horario-tag">Jueves 10:30-12:00</span>
                        </div>
                        <p class="curso-desc">
                            Volcanes, terremotos, océanos misteriosos, atmósfera extrema y tesoros ocultos de nuestro planeta.
                        </p>
                    </div>
                </div>
            </div>

            <div class="highlight-box">
                <h3>⚡ Responsabilidades del Club</h3>
                <ul>
                    <li>Todas las planificaciones de contenido están a cargo del club</li>
                    <li>Material didáctico y recursos provistos por la plataforma</li>
                    <li>Soporte técnico y administrativo incluido</li>
                    <li>Sistema de gestión de clases (LMS) completamente configurado</li>
                </ul>
            </div>

            <div class="highlight-box" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white;">
                <h3 style="color: white;">💰 Condiciones de Pago</h3>
                <ul>
                    <li style="color: white;">Pago mensual por las clases dictadas</li>
                    <li style="color: white;">Facturación al finalizar cada mes</li>
                    <li style="color: white;">Transferencia bancaria dentro de los 5 días hábiles</li>
                </ul>
            </div>

            <div class="confirmation-box">
                <h3>📢 Confirmación Requerida</h3>
                <p class="date">20 de Noviembre</p>
                <p>
                    Solicitamos confirmar tu participación antes de esta fecha para poder coordinar la logística de la colonia.
                    <br><br>
                    En caso de no recibir confirmación, nos veremos en la necesidad de buscar un reemplazo para cubrir los cursos asignados.
                    <br><br>
                    <strong>¡Esperamos contar contigo para esta aventura de verano! 🚀</strong>
                </p>
            </div>
        </div>

        <div class="footer">
            <p style="font-size: 36px; font-weight: 900; margin-bottom: 15px; letter-spacing: 3px;
                      background: linear-gradient(45deg, #fff, #a78bfa, #fff, #fbbf24, #fff);
                      background-size: 200% auto;
                      -webkit-background-clip: text;
                      -webkit-text-fill-color: transparent;
                      background-clip: text;
                      animation: gradient-shift 3s ease infinite;
                      text-shadow: 0 0 30px rgba(167, 139, 250, 0.5);">
                MATEATLETAS CLUB STEAM
            </p>
            <p style="font-size: 20px; opacity: 0.95; font-weight: 300; letter-spacing: 4px; text-transform: uppercase;">
                ✨ Summer 2026 ✨
            </p>
        </div>

        <style>
            @keyframes gradient-shift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }
        </style>
    </div>
</body>
</html>`;

// ═══════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════
const outputFileName = 'Colonia_Verano_2025_Directiva.pdf';

async function generarPDF() {
  console.log('🚀 Iniciando conversión HTML a PDF con Puppeteer...\n');

  try {
    // Crear directorio de salida
    const outputDir = path.join(process.cwd(), 'pdfs-output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 Directorio creado: ${outputDir}\n`);
    }

    const outputPath = path.join(outputDir, outputFileName);

    // Inicializar Puppeteer
    console.log('🌐 Iniciando navegador headless...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Cargar el HTML
    console.log('📄 Cargando contenido HTML...');
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    // Generar el PDF
    console.log('🖨️  Generando PDF...');
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: false,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    await browser.close();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ PDF GENERADO EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📄 Archivo: ${outputPath}`);
    console.log(
      `📏 Tamaño: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`,
    );
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('💡 Para descargar el archivo:');
    console.log(`   ${outputPath}`);
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

generarPDF();
