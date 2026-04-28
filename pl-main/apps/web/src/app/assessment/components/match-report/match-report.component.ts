import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatchReport } from '@gen/web-services';
import { CountMatchesPipe } from '../../pipes/count-matches.pipe';
import { FilterPipe } from '../../pipes/filter.pipe';

/**
 * Component for displaying the candidate match report and recommendations
 */
@Component({
  selector: 'app-match-report',
  standalone: true,
  imports: [CommonModule, FilterPipe, CountMatchesPipe],
  template: `
    <div class="report-container">
      <div class="header">
        <h1>Assessment Results</h1>
        <p class="date">{{ report.assessmentId }}</p>
      </div>

      <!-- Overall Match Score -->
      <div class="match-score-card">
        <div class="score-circle">
          <span class="score-number">{{ report.overallMatchPercentage }}%</span>
          <span class="score-label">Match</span>
        </div>

        <div class="score-details">
          <h2>Overall Fit Assessment</h2>
          <p class="recommendation" [class]="'rec-' + report.hiringRecommendation.toLowerCase()">
            {{ getRecommendationText(report.hiringRecommendation) }}
          </p>
          <p class="summary">{{ report.summaryAssessment }}</p>
        </div>
      </div>

      <!-- Skill Matches -->
      <div class="section">
        <h3 class="section-title">Skill Analysis</h3>

        <div class="skills-grid">
          <div class="skill-group">
            <h4 class="group-label">✓ Matched Skills</h4>
            <div class="skill-list">
              <div *ngFor="let skill of report.skillMatches | slice: 0: (report.skillMatches | slice: 0: 5 | filter: 'matchScore' | countMatches)" 
                   class="skill-item matched">
                <span class="skill-name">{{ skill.skillName }}</span>
                <span class="skill-score">{{ skill.matchScore }}%</span>
              </div>
            </div>
          </div>

          <div class="skill-group">
            <h4 class="group-label">⚠ Missing Critical Skills</h4>
            <div *ngIf="report.criticalMissingSkills && report.criticalMissingSkills.length > 0" class="skill-list">
              <div *ngFor="let skill of report.criticalMissingSkills" class="skill-item missing">
                {{ skill }}
              </div>
            </div>
            <div *ngIf="!report.criticalMissingSkills || report.criticalMissingSkills.length === 0" class="empty-state">
              No critical skills missing
            </div>
          </div>

          <div class="skill-group">
            <h4 class="group-label">➕ Additional Skills</h4>
            <div *ngIf="report.additionalSkills && report.additionalSkills.length > 0" class="skill-list">
              <div *ngFor="let skill of report.additionalSkills" class="skill-item additional">
                {{ skill }}
              </div>
            </div>
            <div *ngIf="!report.additionalSkills || report.additionalSkills.length === 0" class="empty-state">
              No additional skills found
            </div>
          </div>
        </div>

        <!-- Detailed Skill Matches Table -->
        <div class="section">
          <h4 class="subsection-title">Detailed Skill Breakdown</h4>
          <table class="skill-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Required</th>
                <th>Candidate</th>
                <th>Score</th>
                <th>Gap Analysis</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let match of (report?.skillMatches || [])" [class.missing]="match.matchScore === 0">
                <td class="skill-name">{{ match.skillName }}</td>
                <td>{{ match.requiredProficiency }}</td>
                <td [class.proficient]="match.candidateProficiency === 'Proficient'">
                  {{ match.candidateProficiency }}
                </td>
                <td>
                  <div class="score-bar">
                    <div class="score-fill" [style.width.%]="match.matchScore"></div>
                  </div>
                  {{ match.matchScore }}%
                </td>
                <td class="gap-text">{{ match.gapAnalysis }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recommendations -->
      <div class="section">
        <h3 class="section-title">Recommendations for Growth</h3>

        <div class="recommendations-list">
          <div *ngFor="let rec of (report?.recommendations || [])" class="recommendation-item">
            <div class="rec-header">
              <h4 class="rec-title">{{ rec.description }}</h4>
              <span class="rec-priority" [class]="'priority-' + (rec.priority || '').toLowerCase()">
                {{ rec.priority }}
              </span>
            </div>

            <div class="rec-details">
              <div class="effort-badge">
                📅 {{ rec.estimatedEffort }}
              </div>

              <div *ngIf="rec.resources && rec.resources.length > 0" class="resources">
                <h5>Suggested Resources:</h5>
                <ul>
                  <li *ngFor="let resource of rec.resources">{{ resource }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="btn btn-primary" (click)="downloadReport()">
          📥 Download Report
        </button>
        <button class="btn btn-secondary" (click)="shareReport()">
          📤 Share Results
        </button>
        <button class="btn btn-outline" (click)="startNewAssessment()">
          ↻ New Assessment
        </button>
      </div>
    </div>
  `,
  styles: [`
    .report-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      color: #333;
    }

    .date {
      margin: 0;
      font-size: 0.875rem;
      color: #666;
    }

    .match-score-card {
      display: flex;
      gap: 2rem;
      align-items: center;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }

    .score-circle {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 150px;
      height: 150px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      flex-shrink: 0;
    }

    .score-number {
      font-size: 3.5rem;
      font-weight: bold;
      line-height: 1;
    }

    .score-label {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 0.5rem;
      opacity: 0.9;
    }

    .score-details {
      flex: 1;
    }

    .score-details h2 {
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
    }

    .recommendation {
      margin: 0.5rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      padding: 0.5rem 0;
    }

    .rec-strongyes { color: #d4edda; }
    .rec-yes { color: #fff3cd; }
    .rec-maybe { color: #fff3cd; }
    .rec-no { color: #f8d7da; }
    .rec-strongno { color: #f8d7da; }

    .summary {
      margin: 1rem 0 0 0;
      opacity: 0.95;
      line-height: 1.6;
    }

    .section {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .section-title {
      margin: 0 0 1.5rem 0;
      font-size: 1.25rem;
      color: #333;
      border-bottom: 3px solid #667eea;
      padding-bottom: 0.75rem;
      display: inline-block;
    }

    .subsection-title {
      margin: 1.5rem 0 1rem 0;
      font-size: 1rem;
      color: #333;
    }

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .skill-group {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
    }

    .group-label {
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
      text-transform: uppercase;
      color: #666;
      font-weight: 600;
    }

    .skill-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .skill-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: white;
      border-radius: 4px;
      border-left: 4px solid #dee2e6;
    }

    .skill-item.matched {
      border-left-color: #28a745;
      background-color: #f0f9f4;
    }

    .skill-item.missing {
      border-left-color: #dc3545;
      background-color: #fdf5f5;
    }

    .skill-item.additional {
      border-left-color: #17a2b8;
      background-color: #f0f7f9;
    }

    .skill-name {
      font-weight: 600;
      color: #333;
    }

    .skill-score {
      background: #e7f3ff;
      color: #0056b3;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .empty-state {
      text-align: center;
      color: #999;
      padding: 1rem;
      font-style: italic;
    }

    .skill-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }

    .skill-table th {
      background-color: #f8f9fa;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #dee2e6;
    }

    .skill-table td {
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
    }

    .skill-table tr.missing {
      background-color: #fdf5f5;
    }

    .score-bar {
      display: inline-block;
      width: 100px;
      height: 6px;
      background-color: #e9ecef;
      border-radius: 3px;
      overflow: hidden;
      margin-right: 0.5rem;
    }

    .score-fill {
      height: 100%;
      background: linear-gradient(90deg, #28a745, #667eea);
    }

    .gap-text {
      font-size: 0.875rem;
      color: #666;
    }

    .proficient {
      color: #28a745;
      font-weight: 600;
    }

    .recommendations-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .recommendation-item {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .rec-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;
    }

    .rec-title {
      margin: 0;
      font-size: 1rem;
      color: #333;
      flex: 1;
    }

    .rec-priority {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .priority-critical {
      background-color: #f8d7da;
      color: #721c24;
    }

    .priority-high {
      background-color: #fff3cd;
      color: #856404;
    }

    .priority-medium {
      background-color: #d1ecf1;
      color: #0c5460;
    }

    .rec-details {
      margin-top: 1rem;
    }

    .effort-badge {
      display: inline-block;
      background-color: #e7f3ff;
      color: #0056b3;
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 1rem;
    }

    .resources {
      margin-top: 1rem;
    }

    .resources h5 {
      margin: 0 0 0.75rem 0;
      font-size: 0.875rem;
      color: #333;
    }

    .resources ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #666;
      font-size: 0.875rem;
    }

    .resources li {
      margin-bottom: 0.5rem;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 3rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-primary {
      background-color: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background-color: #5568d3;
    }

    .btn-secondary {
      background-color: #764ba2;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #633a87;
    }

    .btn-outline {
      background-color: white;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-outline:hover {
      background-color: #f8f9fa;
    }
  `],
})
export class MatchReportComponent {
  @Input() report!: MatchReport;

  getRecommendationText(recommendation: string): string {
    const recommendations: Record<string, string> = {
      StrongYes: '🌟 Strong Candidate - Highly Recommended',
      Yes: '✓ Good Match - Recommended',
      Maybe: '⚠ Moderate Match - Consider with Training',
      No: '✗ Below Average Match',
      StrongNo: '❌ Poor Match - Not Recommended',
    };
    return recommendations[recommendation] || recommendation;
  }

  downloadReport(): void {
    // Implementation for downloading report as PDF
    console.log('Download report:', this.report);
    alert('Report download functionality to be implemented');
  }

  shareReport(): void {
    // Implementation for sharing report
    console.log('Share report:', this.report);
    alert('Share functionality to be implemented');
  }

  startNewAssessment(): void {
    // Implementation for starting new assessment
    window.location.href = '/assessment';
  }
}
