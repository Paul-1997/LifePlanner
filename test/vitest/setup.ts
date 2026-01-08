import { vi } from 'vitest';
import { config } from '@vue/test-utils';
import { Quasar } from 'quasar';

// 配置 Vue Test Utils
config.global.plugins = [Quasar];

// 模拟全局对象
global.CSS = { supports: () => false } as any;

// 设置 Quasar 语言包和图标集
config.global.stubs = {
  transition: false,
  'transition-group': false,
};
