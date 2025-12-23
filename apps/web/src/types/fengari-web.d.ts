/**
 * Type declarations for fengari-web (Lua interpreter for browser)
 */
declare module 'fengari-web' {
  export interface LuaState {
    lua_load(source: string): void;
    lua_pcall(nargs: number, nresults: number, errfunc: number): number;
    lua_pop(n: number): void;
    lua_tostring(index: number): string | null;
    lua_tointeger(index: number): number;
    lua_tonumber(index: number): number;
    lua_toboolean(index: number): boolean;
    lua_pushstring(s: string): void;
    lua_pushnumber(n: number): void;
    lua_pushboolean(b: boolean): void;
    lua_pushnil(): void;
    lua_getglobal(name: string): number;
    lua_setglobal(name: string): void;
    lua_gettop(): number;
    lua_settop(index: number): void;
    lua_type(index: number): number;
  }

  export function lua_newstate(): LuaState;
  export function lua_close(L: LuaState): void;

  export const fengari: {
    lua: {
      lua_newstate: () => LuaState;
      lua_close: (L: LuaState) => void;
      lua_pcall: (L: LuaState, nargs: number, nresults: number, errfunc: number) => number;
      luaL_dostring: (L: LuaState, s: string) => number;
      LUA_OK: number;
      LUA_ERRSYNTAX: number;
      LUA_ERRRUN: number;
    };
    lauxlib: {
      luaL_newstate: () => LuaState;
      luaL_openlibs: (L: LuaState) => void;
      luaL_loadstring: (L: LuaState, s: string) => number;
    };
    to_jsstring: (s: Uint8Array | null) => string;
    to_luastring: (s: string) => Uint8Array;
  };

  export default fengari;
}
