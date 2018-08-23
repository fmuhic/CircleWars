class Game {

    constructor(canvasSize, player, projectilePool, enemyPool) {

        this.player        = player;
        this.projectiles   = projectilePool;
        this.enemies       = enemyPool;
        this.canvasSize    = canvasSize;
        this.moveDirection = new V2();
    }

    processInput(input) {
        let LEFT  = new V2(-1, 0);
        let RIGHT = new V2(1, 0);
        let UP    = new V2(0, 1);
        let DOWN  = new V2(0, -1);

        this.moveDirection = new V2();
        input.keys.forEach((k) => {
            if(k.key === 'a' && k.isPushed()) 
                this.moveDirection = vadd(this.moveDirection, LEFT);
            else if(k.key === 'd' && k.isPushed())
                this.moveDirection = vadd(this.moveDirection, RIGHT);
            else if(k.key === 'w' && k.isPushed())
                this.moveDirection = vadd(this.moveDirection, UP);
            else if(k.key === 's' && k.isPushed())
                this.moveDirection = vadd(this.moveDirection, DOWN);
        });

        if(!veq(this.moveDirection, new V2()))
            this.moveDirection = vunit(this.moveDirection);
    }

    updateState(dt, mousePosition) {
        this.player.move(dt, this.moveDirection, this.canvasSize);

        this.projectiles.move(dt)
        this.enemies.move(dt, this.player.position);
        this.checkProjectileEnemyCollisions();

        this.spawnNewProjectile(mousePosition);
        this.spawnNewEnemy();

        this.projectiles.removeDeadProjectiles(this.canvasSize);
        this.enemies.removeDeadEnemies();
    }

    renderFrame(context) {
        // Clear screen
        context.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);

        this.projectiles.render(context, this.canvasSize)
        this.enemies.render(context, this.canvasSize)
        this.player.render(context, this.canvasSize);
    }

    // This is brute force (n^2) collision check. 
    // It's very inneficient but its fine for now since we don't have many objects in the game.
    checkProjectileEnemyCollisions() {
        let pIter = this.projectiles.getIterator(); 
        let eIter = this.enemies.getIterator(); 

        let p = null;
        while(p = pIter.getNext()) {
            eIter.reset();
            let e = null;
            while((e = eIter.getNext()) && p.isAlive) {
                let result = checkCollision(p, e);
                if(result.collided) {
                    e.die();
                    p.die();
                }
            }
        }
    }

    spawnNewProjectile(mousePosition) {
        let position = this.player.position;
        let direction = vunit(vsub(new V2(mousePosition.x, mousePosition.y), position));
        this.projectiles.spawnProjectile(position, direction);
    }

    spawnNewEnemy() {
        let side = Math.round(Math.random() * 1000 % 4);
        let position = new V2(this.canvasSize.x, 0);
        if(side === 0)
            position  = new V2(0, this.canvasSize.y);
        else if(side == 1)
            position   = new V2(this.canvasSize.x, this.canvasSize.y);
        else if(side == 2)
            position  = new V2(0, 0);

        this.enemies.spawnEnemy(position);
    }
}

