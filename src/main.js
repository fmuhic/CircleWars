window.onload = () => {

    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");
    // canvas.setAttribute('width', window.innerWidth + "px");
    // canvas.setAttribute('height', window.innerHeight + "px");
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let canvasSize = new V2(canvas.width, canvas.height);

    let player = new Player(new V2(canvasSize.x / 2, canvasSize.y / 2), 30, 0.002,
                                    "#58D68D", "#28B463");;
    let projectilePool = new ProjectilePool(10, 1.5, "#5DADE2", "#3498DB");
    let enemyPool = new EnemyPool(30, 25, 0.002, "#D98880", "#A93226");
    let game = new Game(canvasSize, player, projectilePool, enemyPool);

    // Process mouse input
    let mousePosition = new V2();
    canvas.addEventListener('mousemove',
                            (e) => mousePosition = new V2(e.offsetX, canvasSize.y - e.offsetY));

    // Very primitive keyboard input processing
    let input = new InputHandler(['a', 's', 'd', 'w']);
    document.addEventListener("keydown", (e) => input.push(e.key));
    document.addEventListener("keyup", (e) => input.release(e.key));

    const dtms     = 5;
    let updateTime = 0;

    function loop(timestamp) {

        game.processInput(input);
        while(updateTime <= timestamp) {
            game.updateState(dtms, mousePosition);
            updateTime += dtms;
        }
        game.renderFrame(ctx);

        window.requestAnimationFrame(loop);
    }

    window.requestAnimationFrame(loop);
}
