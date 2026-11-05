# Notes

## What the plugin does
Що робить команда і що ще є в плагіні.

## How to install it
Дві команди з кроку 7.

## Scoping decision
Читачі мають лише Read, Grep і Glob, бо вони звітують і не повинні змінювати код.
Для test-gap-finder достатньо haiku, бо це просте порівняння.

## Orchestration decision
Читачі працюють паралельно, бо не залежать один від одного.
test-writer чекає на них, бо їхні звіти це його вхідні дані.