## 検証スクリプトの使い方

ソースの取得
```
git clone https://github.com/SingularitySociety/WorldModels.git
```

```
cd WorldModels
```

必要なパッケージのインストール
```
yarn install
```

設定ファイルのコピー
```
cp .env_sample .env
```

必要なapi keyを取得して.envを更新します。
api keyがセットされているLLMは実行されるので、設定していないAPI KEYは削除してください

例: GOOGLE_GENAI_API_KEYがセットされている -> Geminiが実行される


テスト実行
```
yarn run test
```

実行結果はコンソールに出力されると共に、resultsディレクトリーにファイルとしてMarkdown形式で保存されます
