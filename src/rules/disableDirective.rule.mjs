export const disableDirective = {
	meta: {
		docs: {
			description: 'Require reviewed policy exceptions instead of inline JST rule disables.',
			recommended: true,
			url: 'https://github.com/jst-stack/eslint-plugin-architecture/blob/main/docs/rules/disable-directive.md',
		},
		messages: { jstRule: 'Do not disable architecture rules inline. Add a narrow reviewed exception to jst.config.ts.' },
		schema: [],
		type: 'problem',
	},
	create(context) {
		return {
			Program() {
				for (const comment of context.sourceCode.getAllComments()) {
					validateComment(context, comment)
				}
			},
		}
	},
}

function validateComment(context, comment) {
	const match = comment.value.match(/eslint-disable(?:-next-line|-line)?\b(?<body>.*)/u)
	if (!match) {
		return
	}
	const [ruleText = ''] = match.groups?.body?.split(/\s--\s/u, 2) ?? []
	const rules = ruleText
		.split(',')
		.map((rule) => rule.trim())
		.filter(Boolean)
	if (!rules.length || rules.some((rule) => rule.startsWith('jst/'))) {
		context.report({ messageId: 'jstRule', node: comment })
	}
}
