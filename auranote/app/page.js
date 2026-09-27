'use client';
import Link from 'next/link';
import Navbar from './components/Navbar';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroOrbs}>
            <div className={styles.orb1}></div>
            <div className={styles.orb2}></div>
            <div className={styles.orb3}></div>
          </div>
          <div className={styles.heroContent}>
            <div className={styles.badge}>✨ Potenciado por Inteligencia Artificial</div>
            <h1 className={styles.heroTitle}>
              Tus apuntes universitarios, potenciados por <span className="gradient-text">IA</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Toma una foto, graba un audio o escribe un tema. AuraNote transforma todo en apuntes organizados y listos para estudiar.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/registro" className={styles.btnPrimary}>Comenzar Gratis →</Link>
              <a href="#como-funciona" className={styles.btnOutline}>Ver cómo funciona</a>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNumber}>10K+</span>
                <span className={styles.heroStatLabel}>Apuntes</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNumber}>5K+</span>
                <span className={styles.heroStatLabel}>Estudiantes</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNumber}>4.9★</span>
                <span className={styles.heroStatLabel}>Rating</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="caracteristicas" className={styles.features}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Todo lo que necesitas para estudiar mejor</h2>
            <p className={styles.sectionSubtitle}>Herramientas potenciadas por IA diseñadas para universitarios</p>
          </div>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>📸</span>
              <h3 className={styles.featureTitle}>Foto → Apuntes</h3>
              <p className={styles.featureDesc}>Captura la pizarra con tu cámara y obtén apuntes perfectamente organizados al instante.</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🎤</span>
              <h3 className={styles.featureTitle}>Audio → Apuntes</h3>
              <p className={styles.featureDesc}>Graba la explicación del profesor y la IA la convierte en notas claras y estructuradas.</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>📝</span>
              <h3 className={styles.featureTitle}>Tema → Apuntes</h3>
              <p className={styles.featureDesc}>Escribe el título del tema y genera apuntes completos con definiciones y ejemplos.</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🎬</span>
              <h3 className={styles.featureTitle}>Video → Apuntes</h3>
              <p className={styles.featureDesc}>Sube un video educativo y extrae automáticamente la información clave.</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🧠</span>
              <h3 className={styles.featureTitle}>Herramientas de Estudio</h3>
              <p className={styles.featureDesc}>Flashcards, quizzes y resúmenes generados automáticamente desde tus apuntes.</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>👥</span>
              <h3 className={styles.featureTitle}>Colaboración</h3>
              <p className={styles.featureDesc}>Comparte apuntes con tus compañeros y trabajen juntos en proyectos de equipo.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="como-funciona" className={styles.howItWorks}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>¿Cómo funciona?</h2>
            <p className={styles.sectionSubtitle}>En solo 3 pasos simples</p>
          </div>
          <div className={styles.stepsContainer}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <span className={styles.stepIcon}>📤</span>
              <h3 className={styles.stepTitle}>Sube tu contenido</h3>
              <p className={styles.stepDesc}>Foto, audio, video o simplemente escribe el tema</p>
              <div className={styles.stepConnector}></div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <span className={styles.stepIcon}>🤖</span>
              <h3 className={styles.stepTitle}>La IA lo procesa</h3>
              <p className={styles.stepDesc}>Gemini analiza y organiza la información inteligentemente</p>
              <div className={styles.stepConnector}></div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <span className={styles.stepIcon}>✨</span>
              <h3 className={styles.stepTitle}>Obtén tus apuntes</h3>
              <p className={styles.stepDesc}>Organizados, claros y listos para estudiar</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>¿Listo para revolucionar tu forma de estudiar?</h2>
            <p className={styles.ctaSubtitle}>Únete a miles de estudiantes que ya usan AuraNote</p>
            <Link href="/registro" className={styles.btnPrimary}>Crear cuenta gratis →</Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div>
            <div className={styles.footerLogo}>
              <span className={styles.footerLogoIcon}>✦</span>
              <span className="gradient-text">AuraNote</span>
            </div>
            <p className={styles.footerDesc}>Tu compañero de estudio impulsado por inteligencia artificial. Convierte cualquier fuente de información en conocimiento estructurado.</p>
          </div>
          <div>
            <h4 className={styles.footerLinksTitle}>Enlaces</h4>
            <a href="#caracteristicas" className={styles.footerLink}>Características</a>
            <a href="#como-funciona" className={styles.footerLink}>Cómo funciona</a>
            <Link href="/login" className={styles.footerLink}>Iniciar Sesión</Link>
          </div>
          <div>
            <h4 className={styles.footerLinksTitle}>Legal</h4>
            <Link href="/privacidad" className={styles.footerLink}>Privacidad</Link>
            <Link href="/terminos" className={styles.footerLink}>Términos</Link>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 AuraNote. Todos los derechos reservados.</span>
          <span>Hecho con ❤️ para universitarios</span>
        </div>
      </footer>
    </>
  );
}
