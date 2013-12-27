(function(window) {

    function skew(root) {
        var save;
        if(root.level !== 0) {
            if(root.left.level === root.level) {
                save = root;
                root = root.left;
                save.left = root.right;
                root.right = save;
            }
            root.right = skew(root.right);
        }
        return root;
    }

    function split(root) {
        var save;
        if(root.right.right.level === root.level && root.level !== 0) {
            save = root;
            root = root.right;
            save.right = root.left;
            root.left = save;
            root.level += 1;
            root.right = split(root.right);
        }
        return root;
    }

    function insert(root, key, value) {
        if(root === TreeNode.nil) {
            return new TreeNode(1, TreeNode.nil, TreeNode.nil, key, value);
        } else if(root.key < key) {
            root.right = insert(root.right, key, value);
        } else {
            root.left = insert(root.left, key, value);
        }
        return split(skew(root));
    }

    function remove(root, key) {
        var heir;
        if(root !== TreeNode.nil) {
            if(root.key == key) {
                if(root.left !== TreeNode.nil && root.right !== TreeNode.nil) {
                    heir = root.left;
                    while(heir.right !== TreeNode.nil) {
                        heir = heir.right;
                    }
                    root.key = heir.key;
                    root.value = heir.value;
                    root.left = remove(root.left, root.key);
                } else if(root.left === TreeNode.nil) {
                    root = root.right;
                } else {
                    root = root.left;
                }
            } else if(root.key < key) {
                root.right = remove(root.right, key);
            } else {
                root.left = remove(root.left, key);
            }
        }

        if (root.left.level  < (root.level - 1) ||
            root.right.level < (root.level - 1)
        ){
            root.level -= 1;
            if(root.right.level > root.level) {
                root.right.level = root.level;
            }
            root = split(skew(root));
        }

        return root;
    }

    function walk(root, callback, level) {
        if(root === TreeNode.nil) {
            return;
        }
        walk(root.left, callback, level + 1);
        callback.call(root, root, level);
        walk(root.right, callback, level + 1);
        return;
    }

    // Constructor
    function TreeNode(level, left, right, key, value) {
        this.level = level;
        this.left = left;
        this.right = right;
        this.key = key;
        this.value = value;
    }

    // Creating sentinel node
    TreeNode.nil = new TreeNode(0);
    TreeNode.nil.left = TreeNode.nil;
    TreeNode.nil.right = TreeNode.nil;

    // container class
    function Tree() {
        this.root = TreeNode.nil;
    }

    Tree.prototype.insert = function(key, value) {
        this.root = insert(this.root, key, value);
    };

    Tree.prototype.remove = function(key, value) {
        this.root = remove(this.root, key, value);
    };

    Tree.prototype.forEach = function(callback) {
        var index = 0;
        var internalCallback = function(root, level) {
            callback.call(root, root, index++, level);
        }
        walk(this.root, internalCallback, 0);
    };

    // Interface for outside world
    window.Tree = Tree;
    window.TreeNode = TreeNode;
})(this);
