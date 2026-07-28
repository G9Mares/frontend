import { ChangeDetectionStrategy, Component, HostListener, computed, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

type DocumentationSection = 'frontend' | 'backend' | 'infrastructure' | 'resources';

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

  @HostListener('window:resize')
  onWindowResize(): void {
    this.viewportWidth.set(window.innerWidth);
  }

  selectSection(section: DocumentationSection): void {
    this.activeSection.set(section);
  }

}
