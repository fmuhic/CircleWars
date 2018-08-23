class V2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

vneg   = (v) => new V2(-v.x, -v.y);
vsub   = (v1, v2) => new V2(v1.x - v2.x, v1.y - v2.y);
vadd   = (v1, v2) => new V2(v1.x + v2.x, v1.y + v2.y);
vmult  = (v, c) => new V2(v.x * c, v.y * c);
vlen   = (v) => Math.sqrt(v.x * v.x + v.y * v.y);

veq = (v1, v2) => v1.x === v2.x && v1.y === v2.y;

vunit = (v) => {
    l = vlen(v);
    return new V2(v.x / l, v.y / l);
}

vnorm = (v) => new V2(-v.y, v.x);

rotate = (v, a) => new V2(Math.cos(a) * v.x - Math.sin(a) * v.y,
                          Math.sin(a) * v.x + Math.cos(a) * v.y);

degToRad = (a) => a * Math.PI / 180;

dot = (v1, v2) => v1.x * v2.x + v1.y * v2.y;

// Two circles are colliding if distance between them is less than sum of their radii.
checkCollision = (a, b) => {
    let diff = a.radius + b.radius - vlen(vsub(b.position, a.position));

    if(diff > 0) {
        let errorDelta = 0.001;
        return {collided : true,
                normal : vunit(vsub(b.position, a.position)),
                depth : Math.abs(diff) + errorDelta}
    }
    else     
        return {collided : false};
}

resolveCollision = (a, b, manifest) => {
    // Just a static collision resolution for now
    a.position = vadd(a.position, vmult(manifest.normal, -0.5 * manifest.depth));
    b.position = vadd(b.position, vmult(manifest.normal, 0.5 * manifest.depth));
}
