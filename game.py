import pygame
import sys

# Инициализация Pygame
pygame.init()

# Константы экрана
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
FPS = 60

# Цвета
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
BLUE = (0, 0, 255)
YELLOW = (255, 255, 0)
GREEN = (0, 255, 0)

# Создание экрана
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Cube Jump Game")
clock = pygame.time.Clock()

class Player(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.width = 40
        self.height = 40
        self.image = pygame.Surface((self.width, self.height))
        self.rect = self.image.get_rect()
        self.rect.x = 100
        self.rect.y = SCREEN_HEIGHT - 100

        self.vel_x = 0
        self.vel_y = 0
        self.on_ground = False

    def draw(self, surface):
        # Отрисовка кубика (тела)
        pygame.draw.rect(surface, BLUE, self.rect)

        # Отрисовка лица
        # Глаза
        eye_radius = 3
        pygame.draw.circle(surface, BLACK, (self.rect.x + 10, self.rect.y + 12), eye_radius)
        pygame.draw.circle(surface, BLACK, (self.rect.x + 30, self.rect.y + 12), eye_radius)

        # Рот
        pygame.draw.line(surface, BLACK, (self.rect.x + 12, self.rect.y + 28), (self.rect.x + 28, self.rect.y + 28), 2)

    def jump(self):
        if self.on_ground:
            self.vel_y = -15
            self.on_ground = False

    def update(self):
        # Гравитация
        self.vel_y += 0.8

        # Обновление позиции по Y
        self.rect.y += self.vel_y

        # Обновление позиции по X
        self.rect.x += self.vel_x

        # Ограничение по границам экрана
        if self.rect.left < 0:
            self.rect.left = 0
        if self.rect.right > SCREEN_WIDTH:
            self.rect.right = SCREEN_WIDTH

class Platform(pygame.sprite.Sprite):
    def __init__(self, x, y, width, height):
        super().__init__()
        self.image = pygame.Surface((width, height))
        self.image.fill(GREEN)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y

    def draw(self, surface):
        pygame.draw.rect(surface, GREEN, self.rect)

# Создание групп спрайтов
all_sprites = pygame.sprite.Group()
platforms = pygame.sprite.Group()

# Создание игрока
player = Player()
all_sprites.add(player)

# Создание уровней (платформ)
ground = Platform(0, SCREEN_HEIGHT - 40, SCREEN_WIDTH, 40)
p1 = Platform(200, 450, 150, 20)
p2 = Platform(450, 350, 150, 20)
p3 = Platform(150, 250, 150, 20)
p4 = Platform(500, 150, 150, 20)

platforms.add(ground, p1, p2, p3, p4)
all_sprites.add(ground, p1, p2, p3, p4)

def main():
    running = True
    screenshot_saved = False

    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP:
                    player.jump()
                if event.key == pygame.K_ESCAPE:
                    running = False

        keys = pygame.key.get_pressed()
        player.vel_x = 0
        if keys[pygame.K_LEFT]:
            player.vel_x = -5
        if keys[pygame.K_RIGHT]:
            player.vel_x = 5
        if keys[pygame.K_DOWN]:
            player.vel_y += 2  # Быстрое падение

        # Обновление
        player.update()

        # Проверка коллизий с платформами
        hits = pygame.sprite.spritecollide(player, platforms, False)
        if hits:
            # Проверяем, падаем ли мы на платформу сверху
            if player.vel_y > 0:
                # Находим самую верхнюю платформу из тех, с которыми столкнулись
                lowest_hit = hits[0]
                for hit in hits:
                    if hit.rect.top < lowest_hit.rect.top:
                        lowest_hit = hit

                if player.rect.bottom <= lowest_hit.rect.top + player.vel_y + 1:
                    player.rect.bottom = lowest_hit.rect.top
                    player.vel_y = 0
                    player.on_ground = True
        else:
            player.on_ground = False

        # Отрисовка
        screen.fill(WHITE)

        for sprite in all_sprites:
            sprite.draw(screen)

        pygame.display.flip()

        clock.tick(FPS)

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
