import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HomePage } from './home-page';

const TEST_CONTENT = 'Test main content';

@Component({
  selector: 'gen-test-host',
  standalone: true,
  imports: [HomePage],
  template: `
    <gen-home-page>
      <section content>{{ testContent }}</section>
    </gen-home-page>
  `,
})
class TestHostComponent {
  testContent = TEST_CONTENT;
}

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('input bindings', () => {
    it('should bind heroBannerHeading to hero banner heading', () => {
      const expected = 'Test Heading';

      fixture.componentRef.setInput('heroBannerHeading', expected);
      fixture.detectChanges();

      const heroBanner = fixture.debugElement.query(
        By.css('[hero-banner-heading]')
      );
      expect(heroBanner.componentInstance.heading).toEqual(expected);
    });

    it('should bind heroBannerBackgroundUrl to hero banner backgroundUrl', () => {
      const expected = 'https://example.com/image.jpg';

      fixture.componentRef.setInput('heroBannerBackgroundUrl', expected);
      fixture.detectChanges();

      const heroBanner = fixture.debugElement.query(
        By.css('[hero-banner-background-url]')
      );
      expect(heroBanner.componentInstance.maxContentWidth).toEqual(expected);
    });

    it('should bind heroBannerBackgroundColor to hero banner backgroundColor', () => {
      const expected = '#0070c4';

      fixture.componentRef.setInput('heroBannerBackgroundColor', expected);
      fixture.detectChanges();

      const heroBanner = fixture.debugElement.query(
        By.css('[hero-banner-background-color]')
      );
      expect(heroBanner.componentInstance.textColor).toEqual(expected);
    });

    it('should bind heroBannerTestId to hero banner testId', () => {
      const expected = 'home-hero-banner';

      fixture.componentRef.setInput('heroBannerTestId', expected);
      fixture.detectChanges();

      const heroBanner = fixture.debugElement.query(
        By.css('[data-testid]')
      );
      expect(heroBanner.nativeElement.getAttribute('data-testid')).toEqual(expected);
    });
  });
});

describe('HomePage content projection', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
  });

  it('should project content into main element', () => {
    const content = hostFixture.debugElement.query(By.css('section[content]'));
    expect(content).toBeTruthy();
    expect(content.nativeElement.textContent).toBe(TEST_CONTENT);
  });
});
