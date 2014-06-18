var config = module.exports;

config["Tests"] = {
    rootPath: "../",
    tests: ["test/testToggle.js"]
};

config["Browser tests"] = {
    extends: "Tests",
    environment: "browser",
    sources: ["StateMachine.js"]
};

config["Node tests"] = {
    extends: "Tests",
    environment: "node"
};

