import { describe, expect, test } from 'vitest';
import { Enum, match, VARIANT } from './enumHelpers';
import { unreachable } from './typeHelpers';

describe('enums', () => {
  type Color = Enum<{
    Rgb: {
      r: number;
      g: number;
      b: number;
    };
    Hsl: {
      h: number;
      s: number;
      l: number;
    };
    Cmyk: {
      c: number;
      m: number;
      y: number;
      k: number;
    };
  }>;

  const Color = Enum.create<Color>({
    Rgb: true,
    Hsl: true,
    Cmyk: true,
  });

  function eraseColorType(color: Color): Color {
    return color;
  }

  test('constructors', () => {
    {
      const color = Color.Rgb({ r: 0, g: 128, b: 255 });
      expect(Color.Rgb.is(color)).toBe(true);
      expect(Color.Hsl.is(color)).toBe(false);
      expect(Color.Cmyk.is(color)).toBe(false);
      expect(color.r).toBe(0);
      expect(color.g).toBe(128);
      expect(color.b).toBe(255);
    }
    {
      const color = Color.Hsl({ h: 180, s: 0.5, l: 1 });
      expect(Color.Rgb.is(color)).toBe(false);
      expect(Color.Hsl.is(color)).toBe(true);
      expect(Color.Cmyk.is(color)).toBe(false);
      expect(color.h).toBe(180);
      expect(color.s).toBe(0.5);
      expect(color.l).toBe(1);
    }
    {
      const color = Color.Cmyk({ c: 0, m: 1 / 3, y: 2 / 3, k: 1 });
      expect(Color.Rgb.is(color)).toBe(false);
      expect(Color.Hsl.is(color)).toBe(false);
      expect(Color.Cmyk.is(color)).toBe(true);
      expect(color.c).toBe(0);
      expect(color.m).toBe(1 / 3);
      expect(color.y).toBe(2 / 3);
      expect(color.k).toBe(1);
    }
  });

  test('discriminants', () => {
    const rgbColor = Color.Rgb({ r: 0, g: 128, b: 255 });
    expect(rgbColor[VARIANT]).toBe('Rgb');

    const hslColor = Color.Hsl({ h: 180, s: 0.5, l: 1 });
    expect(hslColor[VARIANT]).toBe('Hsl');
  });

  test('type guards', () => {
    const color = eraseColorType(Color.Rgb({ r: 0, g: 128, b: 255 }));
    const value = (() => {
      if (Color.Rgb.is(color)) {
        const { r, g, b } = color;
        return { r, g, b };
      } else if (Color.Hsl.is(color)) {
        const { h, s, l } = color;
        return { h, s, l };
      } else if (Color.Cmyk.is(color)) {
        const { c, m, y, k } = color;
        return { c, m, y, k };
      } else {
        unreachable(color);
      }
    })();
    expect(value).toEqual({ r: 0, g: 128, b: 255 });
  });

  test('exhaustiveness checking', () => {
    const color = eraseColorType(Color.Rgb({ r: 0, g: 128, b: 255 }));
    const value = (() => {
      switch (color[VARIANT]) {
        case 'Rgb':
          const { r, g, b } = color;
          return { r, g, b };
        case 'Hsl':
          const { h, s, l } = color;
          return { h, s, l };
      }
    })();
    expect(value).toEqual({ r: 0, g: 128, b: 255 });
  });

  test('pattern matching', () => {
    const rgbColor = Color.Rgb({ r: 0, g: 128, b: 255 });
    const rgbResult = match(eraseColorType(rgbColor), {
      Rgb: ({ r, g, b }) => ({ r, g, b }),
      Hsl: ({ h, s, l }) => ({ h, s, l }),
      Cmyk: ({ c, m, y, k }) => ({ c, m, y, k }),
    });
    expect(rgbResult).toEqual({ r: 0, g: 128, b: 255 });

    const hslColor: Color = Color.Hsl({ h: 180, s: 0.5, l: 1 });
    const hslResult = match(eraseColorType(hslColor), {
      Rgb: ({ r, g, b }) => ({ r, g, b }),
      Hsl: ({ h, s, l }) => ({ h, s, l }),
      Cmyk: ({ c, m, y, k }) => ({ c, m, y, k }),
    });
    expect(hslResult).toEqual({ h: 180, s: 0.5, l: 1 });
  });
});
