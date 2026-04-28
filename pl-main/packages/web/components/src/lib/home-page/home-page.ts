import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Home page layout component with hero banner and content projection.
 *
 * @example
 * ```html
 * <gen-home-page [heroBannerHeading]="'Welcome'">
 *   <p hero-banner-content>Hero description text</p>
 *   <div hero-banner-actions>
 *     <button>Get Started</button>
 *   </div>
 *   <section content>
 *     <h2>Main Content</h2>
 *   </section>
 * </gen-home-page>
 * ```
 *
 * Content Slots:
 * - `[hero-banner-content]` - Content inside the hero banner
 * - `[hero-banner-actions]` - Action buttons in the hero banner
 * - `[content]` - Main page content below the hero
 */
@Component({
  selector: 'gen-home-page',
  standalone: true,
  imports: [],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  /** Hero banner heading text */
  heroBannerHeading = input('');

  /** Hero banner background image url */
  heroBannerBackgroundUrl = input<string | undefined>(undefined);

  /** Hero banner maximum width of the content area. Uses design system default if not specified. */
  heroBannerMaxContentWidth = input<string | undefined>(undefined);

  /** Hero banner background color when no background image is provided. Uses design system default if not specified. */
  heroBannerBackgroundColor = input<string | undefined>(undefined);

  /** Hero banner text color. Uses design system default if not specified. */
  heroBannerTextColor = input<string | undefined>(undefined);

  /** Hero banner test ID */
  heroBannerTestId = input<string | undefined>(undefined);
}
