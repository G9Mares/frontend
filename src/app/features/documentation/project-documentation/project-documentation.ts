import { ChangeDetectionStrategy, Component } from '@angular/core';

interface TechnicalDetail {
  label: string;
  value: string;
}

@Component({
  selector: 'app-project-documentation',
  templateUrl: './project-documentation.html',
  styleUrl: './project-documentation.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDocumentationComponent {
  readonly technicalDetails: TechnicalDetail[] = [
    { label: 'Proyecto', value: 'Sistema de Gestión de Tickets' },
    { label: 'Tipo', value: 'Aplicación web de soporte' },
    { label: 'Estado', value: 'Prueba técnica finalizada' },
    { label: 'Frontend', value: 'Angular' },
    { label: 'Backend', value: 'FastAPI' },
    { label: 'Base de datos', value: 'MySQL' },
    { label: 'Infraestructura', value: 'Docker, AWS EC2 y S3' },
  ];
}
