import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DocumentationService } from '../../../core/services/documentation.service';

type DocumentationSection = 'frontend' | 'backend' | 'infrastructure' | 'resources';

type MarkdownBlock =
  | { kind: 'heading'; level: number; content: string }
  | { kind: 'paragraph'; content: string }
  | { kind: 'unordered-list'; items: string[] }
  | { kind: 'ordered-list'; items: string[] }
  | { kind: 'quote'; content: string }
  | { kind: 'separator' };

interface TechnicalDetail {
  label: string;
  value: string;
}

@Component({
  selector: 'app-project-documentation',
  imports: [NgTemplateOutlet],
  templateUrl: './project-documentation.html',
  styleUrl: './project-documentation.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDocumentationComponent {
  private readonly documentationService = inject(DocumentationService);

  readonly frontendDocument = signal<MarkdownBlock[]>([]);
  readonly backendDocument = signal<MarkdownBlock[]>([]);
  readonly infrastructureDocument = signal<MarkdownBlock[]>(
    this.parseMarkdown(`
# Infraestructura

## Arquitectura de despliegue

El sistema se ejecuta mediante contenedores Docker. Esta decisión permite que cada parte de la solución conserve un entorno predecible y se despliegue de manera consistente, desde una revisión local hasta un entorno de operación.

## Componentes principales

- **Frontend:** presenta los flujos de creación, consulta y gestión de tickets.
- **Backend:** concentra las reglas del negocio y coordina la información del sistema.
- **Base de datos:** conserva de manera relacional los datos necesarios para dar seguimiento a cada solicitud.
- **Almacenamiento de archivos:** mantiene de forma privada las evidencias vinculadas a los tickets.

## Comunicación entre servicios

La interfaz solicita la información necesaria para cada recorrido y presenta resultados comprensibles para solicitantes y personal de soporte. El backend valida las operaciones, aplica las reglas del proceso y coordina el resguardo de los datos y archivos relacionados. Esta separación hace que cada servicio tenga una responsabilidad clara.

## Almacenamiento

La información operativa se conserva en una base de datos relacional, adecuada para mantener relaciones consistentes entre personas, áreas, tickets y acciones de seguimiento. Los archivos se almacenan de forma privada y se ponen a disposición únicamente cuando el flujo autorizado los requiere.

## Escalabilidad

La separación de servicios permite que la solución evolucione por partes. Se pueden ampliar las capacidades de la interfaz, aumentar la atención de solicitudes o ajustar el almacenamiento sin convertir el sistema en una única pieza difícil de mantener.

## Beneficios

- **Facilidad de despliegue:** los contenedores Docker favorecen instalaciones repetibles.
- **Separación de servicios:** cada parte de la solución mantiene un objetivo bien definido.
- **Mantenibilidad:** los cambios pueden concentrarse en la capacidad que los necesita.
- **Seguridad:** la información y los archivos se resguardan de acuerdo con las reglas del sistema.
- **Crecimiento futuro:** la infraestructura brinda una base ordenada para nuevas necesidades.
`),
  );
  readonly documentationLoading = signal(true);
  readonly documentationError = signal<string | null>(null);
  readonly activeSection = signal<DocumentationSection>('frontend');
  readonly viewportWidth = signal(typeof window === 'undefined' ? 1280 : window.innerWidth);
  readonly isCompact = computed(() => this.viewportWidth() < 1024);

  readonly technicalDetails: TechnicalDetail[] = [
    { label: 'Proyecto', value: 'Sistema de Gestión de Tickets' },
    { label: 'Tipo', value: 'Aplicación web de soporte' },
    { label: 'Estado', value: 'Prueba técnica finalizada' },
    { label: 'Frontend', value: 'Angular' },
    { label: 'Backend', value: 'FastAPI' },
    { label: 'Base de datos', value: 'MySQL' },
    { label: 'Infraestructura', value: 'Docker, AWS EC2 y S3' },
  ];

  constructor() {
    this.loadDocumentation();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.viewportWidth.set(window.innerWidth);
  }

  selectSection(section: DocumentationSection): void {
    this.activeSection.set(section);
  }

  loadDocumentation(): void {
    this.documentationLoading.set(true);
    this.documentationError.set(null);

    this.documentationService.getSources().subscribe({
      next: (sources) => {
        this.frontendDocument.set(this.parseMarkdown(sources.frontend));
        this.backendDocument.set(this.parseMarkdown(sources.backend));
      },
      error: () => this.documentationError.set('No fue posible cargar la documentación. Intenta nuevamente.'),
      complete: () => this.documentationLoading.set(false),
    });
  }

  private parseMarkdown(source: string): MarkdownBlock[] {
    const blocks: MarkdownBlock[] = [];
    const paragraphLines: string[] = [];
    const listItems: string[] = [];
    let listKind: 'unordered-list' | 'ordered-list' | null = null;

    const flushParagraph = (): void => {
      if (paragraphLines.length > 0) {
        blocks.push({ kind: 'paragraph', content: this.formatInline(paragraphLines.join(' ')) });
        paragraphLines.length = 0;
      }
    };

    const flushList = (): void => {
      if (listKind && listItems.length > 0) {
        blocks.push({ kind: listKind, items: listItems.map((item) => this.formatInline(item)) });
      }

      listItems.length = 0;
      listKind = null;
    };

    source.split(/\r?\n/).forEach((line) => {
      const heading = /^(#{1,3})\s+(.+)$/.exec(line);
      const unorderedItem = /^[-*+]\s+(.+)$/.exec(line);
      const orderedItem = /^\d+\.\s+(.+)$/.exec(line);
      const quote = /^>\s?(.+)$/.exec(line);

      if (!line.trim()) {
        flushParagraph();
        flushList();
        return;
      }

      if (heading) {
        flushParagraph();
        flushList();
        blocks.push({ kind: 'heading', level: heading[1].length, content: this.formatInline(heading[2]) });
        return;
      }

      if (/^---+$/.test(line.trim())) {
        flushParagraph();
        flushList();
        blocks.push({ kind: 'separator' });
        return;
      }

      if (unorderedItem) {
        flushParagraph();
        if (listKind && listKind !== 'unordered-list') {
          flushList();
        }
        listKind = 'unordered-list';
        listItems.push(unorderedItem[1]);
        return;
      }

      if (orderedItem) {
        flushParagraph();
        if (listKind && listKind !== 'ordered-list') {
          flushList();
        }
        listKind = 'ordered-list';
        listItems.push(orderedItem[1]);
        return;
      }

      if (quote) {
        flushParagraph();
        flushList();
        blocks.push({ kind: 'quote', content: this.formatInline(quote[1]) });
        return;
      }

      flushList();
      paragraphLines.push(line.trim());
    });

    flushParagraph();
    flushList();
    return blocks;
  }

  private formatInline(value: string): string {
    const escaped = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escaped
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\`(.+?)\`/g, '<code>$1</code>');
  }
}
