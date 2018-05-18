# Setup

```sh
git clone https://github.com/ljosberinn/md-programming-books

cd md-programming-books

composer install

npm install

// MAC OS
npx babel assets/js --out-file assets/js/bundle.js --ignore bundle.js,bundle.min.js -w

// WIN
./node_modules/.bin/babel assets/js --out-file assets/js/bundle.js --ignore bundle.js,bundle.min.js -w
```
