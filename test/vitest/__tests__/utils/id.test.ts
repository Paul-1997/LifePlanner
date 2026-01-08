import { describe, it, expect } from 'vitest';
import { generateId, generateUUID } from 'src/utils/id';

describe('id.ts - ID 生成工具', () => {
  describe('generateId()', () => {
    it('應該生成唯一的 ID', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it('生成的 ID 應該包含時間戳和隨機字串', () => {
      const id = generateId();
      const parts = id.split('-');

      expect(parts).toHaveLength(2);
      expect(Number(parts[0])).toBeGreaterThan(0);
      expect(parts[1]).toHaveLength(7);
    });

    it('應該生成字串類型的 ID', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
    });
  });

  describe('generateUUID()', () => {
    it('應該生成符合 UUID v4 格式的 ID', () => {
      const uuid = generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(uuid).toMatch(uuidRegex);
    });

    it('應該生成唯一的 UUID', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();

      expect(uuid1).not.toBe(uuid2);
    });

    it('UUID 長度應該為 36 個字元', () => {
      const uuid = generateUUID();
      expect(uuid).toHaveLength(36);
    });

    it('應該生成多個不同的 UUID', () => {
      const uuids = new Set();
      for (let i = 0; i < 100; i++) {
        uuids.add(generateUUID());
      }
      expect(uuids.size).toBe(100);
    });
  });
});
