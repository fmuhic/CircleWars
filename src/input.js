class Key {
    constructor(key) {
        this.key = key;
        let pushed = false;

        this.isPushed = () => pushed;
        this.push     = () => pushed = true;
        this.release  = () => pushed = false;
    }
}

class InputHandler {
    constructor(keys) {
        this.keys = keys.map((k) => {
            return new Key(k);
        });
    }

    push(k) {
        let key = this.keys.find((elem) => elem.key === k);
        if(key)
            key.push();
    }

    release(k) {
        let key = this.keys.find((elem) => elem.key === k);
        if(key)
            key.release();
    }

    print() {
        this.keys.forEach((k) => console.log("k: " + k.key + ", " + k.isPushed()));
    }
}
