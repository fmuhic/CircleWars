class GameEntity {
    constructor(position, radius, innerColor, borderColor, borderSize) {
        //Todo: fix this acceleration (in player reset method too) 
        this.acceleration = 0.003;
        this.velocity    = new V2();
        this.position    = position;
        this.radius      = radius;
        this.innerColor  = innerColor;
        this.borderColor = borderColor;
        this.borderSize  = borderSize;
        this.isAlive     = true;

    }

    render(context, canvasSize) {
        context.beginPath();
        context.arc(this.position.x, canvasSize.y - this.position.y, this.radius, 0, 2 * Math.PI);
        context.fillStyle = this.innerColor;
        context.fill();
        context.lineWidth = this.borderSize;
        context.strokeStyle = this.borderColor;
        context.stroke();
    }

    die() {
        this.isAlive = false;
    }
}

class Player extends GameEntity {

    constructor(position, radius, acceleration, innerColor, borderColor) {
        super(position, radius, innerColor, borderColor, 3);

        this.acceleration = acceleration;
        this.initPosition = position
    }

    move(dt, direction, gameBound) {
        let acceleration = vmult(direction, this.acceleration);
        this.velocity = vadd(vmult(acceleration, dt), this.velocity);
        this.position = vadd(vmult(this.velocity, 0.5 * dt * dt), this.position);

        //nasty hack that simulates friction (only valid at 5ms update interval)
        this.velocity = vadd(this.velocity, vmult(this.velocity, -0.04));

        let radius = this.radius + this.borderSize;

        if(this.position.x < 0 + radius)
            this.position.x = radius;
        else if (this.position.x > gameBound.x - radius)
            this.position.x = gameBound.x - radius;

        if(this.position.y < 0 + radius)
            this.position.y = radius;
        else if (this.position.y > gameBound.y - radius)
            this.position.y = gameBound.y - radius;
    }

    die() {
        this.velocity = new V2();
        this.acceleration = 0.003;
        this.position = this.initPosition;
    }
}

class Projectile extends GameEntity {

    constructor(id, position, radius, direction, speed, innerColor, borderColor) {
        super(position, radius, innerColor, borderColor, 2);

        this.getId = () => id;
        this.position = position;
        this.speed = speed;
        this.direction = direction;
    }

    update(dt) {
        this.position = vadd(this.position, vmult(this.direction, this.speed * dt));
    }
}

class Enemy extends GameEntity {

    constructor(id, position, radius, acceleration, innerColor, borderColor) {
        super(position, radius, innerColor, borderColor, 2);

        this.acceleration = acceleration;
        this.getId     = () => id;
        this.direction = new V2();
    }

    update(dt, playerPosition) {
        let direction = vunit(vsub(playerPosition, this.position))
        let acceleration = vmult(direction, this.acceleration);
        this.velocity = vadd(vmult(acceleration, dt), this.velocity);
        this.position = vadd(vmult(this.velocity, 0.5 * dt * dt), this.position);

        //nasty hack that simulates friction (only valid at 5ms update interval)
        this.velocity = vadd(this.velocity, vmult(this.velocity, -0.05));
    }
}

class EntityIterator {
    constructor(entities, entityCount) {
        this.entities     = entities;
        this.count        = entityCount;
        this.currentIndex = 0;
    }

    getNext() {
        if(this.currentIndex >= this.count)
            return null;
            
        return this.entities[this.currentIndex++];
    }

    reset() {
        this.currentIndex = 0;
    }
}

class ProjectilePool {
    constructor(radius, speed, innerColor, borderColor) {
        let idCounter    = 0;
        this.createNewId = () => idCounter++;

        this.projectiles        = [];
        this.radius             = radius;
        this.speed              = speed;
        this.innerColor         = innerColor;
        this.borderColor        = borderColor;
        this.newProjectileTimer = 0;
        this.spawnIntervalInMs  = 40;
    }

    move(dt) {
        this.projectiles.forEach((p) => p.update(dt))
    }

    spawnProjectile(position, direction, dt) {
        if(this.newProjectileIsReady(dt)) {
            let randomTilt = degToRad(15 * (-0.5 + Math.random())); 
            direction = rotate(direction, randomTilt);
            this.projectiles.push(new Projectile(this.createNewId(), position,
                                                 this.radius, direction, this.speed,
                                                 this.innerColor, this.borderColor));
        }
    }

    newProjectileIsReady(dt) {
        this.newProjectileTimer += dt;
        if(this.newProjectileTimer >= this.spawnIntervalInMs) {
            this.newProjectileTimer = 0;
            return true;
        }
        else
            return false;
    }

    render(context, canvasSize) {
        this.projectiles.forEach((p) => p.render(context, canvasSize));
    }

    removeDeadProjectiles(gameBound) {
        let isOutOfBounds = (p, bound) => {
            return p.position.x > bound.x || p.position.x < 0 ||
                   p.position.y > bound.y || p.position.y < 0;
        };

        this.projectiles = this.projectiles.filter((p) => {
            if(isOutOfBounds(p, gameBound) || !p.isAlive)
                return false;
            else 
                return true;
        });
    }

    empty() {
        this.projectiles = [];
    }

    getIterator() {
        return new EntityIterator(this.projectiles, this.projectiles.length);
    }
}

class EnemyPool {
    constructor(maxCount, radius, acceleration, innerColor, borderColor) {
        let idCounter    = 0;
        this.createNewId = () => idCounter++;

        this.maxEnemyCount = maxCount;
        this.enemyCount    = 0;
        this.enemies       = [];
        this.radius        = radius;
        this.acceleration  = acceleration;
        this.innerColor    = innerColor;
        this.borderColor   = borderColor;
    }

    render(context, canvasSize) {
        this.enemies.forEach((e) => e.render(context, canvasSize));
    }

    spawnEnemy(position) {
        if(this.enemyCount < this.maxEnemyCount) {
            this.enemies.push(new Enemy(this.createNewId(), 
                                        position, this.radius, this.acceleration,
                                        this.innerColor, this.borderColor));
            this.enemyCount++;
        }
    }

    move(dt, playerPosition) {
        this.enemies.forEach((e) => e.update(dt, playerPosition))

        this.enemies.forEach((a) => {
            this.enemies.forEach((b) => {
                if(a.getId() != b.getId()) {
                    let result = checkCollision(a, b);
                    if(result.collided) {
                        resolveCollision(a, b, result);
                    }
                }
            });
        });
    }

    removeDeadEnemies() {
        this.enemies = this.enemies.filter((e) => {
            if(e.isAlive)
                return true;
            else
                return false;
        });

        this.enemyCount = this.enemies.length;
    }

    empty() {
        this.enemies = [];
    }

    getIterator() {
        return new EntityIterator(this.enemies, this.enemies.length);
    }
}
