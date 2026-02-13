# Chess ELO Calculator

Šachová aplikace pro výpočet ELO ratingu vytvořená ve Vue 3 s TypeScript.

## Funkce

- **Výpočet změny ratingu**: Automatický výpočet změny ELO ratingu na základě výsledků her
- **K-faktor**: Možnost volby K-faktoru (10, 15, 20, 25, 30, 40)
- **Statistiky**: Zobrazení průměrného ratingu soupeřů, celkové změny, performance ratingu a bodů
- **Správa her**: Přidávání a odebírání jednotlivých her
- **Persistence dat**: Ukládání a načítání dat z localStorage

## Výpočty

- **Expected Score**: `E = 1 / (1 + 10^((R_opponent - R_player) / 400))`
- **Rating Change**: `ΔR = K × (Score - Expected)`
- **Performance Rating**: `R_perf = R_avg + 400 × log10(p / (1 - p))`

kde:
- `K` je K-faktor
- `Score` je výsledek hry (1, 0.5, nebo 0)
- `R_avg` je průměrný rating soupeřů
- `p` je procento bodů
