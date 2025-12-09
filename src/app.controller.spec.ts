import { AppModule } from './app.module';

describe('AppModule', () => {
  it('should be defined', () => {
    expect(AppModule).toBeDefined();
  });

  it('should have correct structure', () => {
    const moduleMetadata = Reflect.getMetadata('imports', AppModule);
    expect(moduleMetadata).toBeDefined();
    expect(Array.isArray(moduleMetadata)).toBe(true);
  });
});
