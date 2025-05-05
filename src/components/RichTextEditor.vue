<template>
	<div class="rich-text-editor" :class="{ 'is-dark': isDarkMode }">
		<div class="editor-toolbar" v-if="!readOnly">
			<button
				v-for="item in menuItems"
				:key="item.action"
				@click="item.action"
				:class="{ 'is-active': isButtonActive(item) }"
				class="toolbar-button"
				type="button"
			>
				<i :class="item.icon"></i>
			</button>
		</div>
		<editor-content :editor="editor" />
	</div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { mapState } from 'pinia';
import { useThemeStore } from '@/stores/theme';

export default {
	name: 'RichTextEditor',
	components: {
		EditorContent,
	},
	props: {
		modelValue: {
			type: String,
			default: '',
		},
		readOnly: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['update:modelValue'],
	computed: {
		...mapState(useThemeStore, ['isDarkMode']),
		menuItems() {
			return [
				{
					icon: 'fas fa-bold',
					action: () => this.editor?.chain().focus().toggleBold().run(),
					isActive: () =>
						this.editor && this.editor.isActive ? this.editor.isActive('bold') : false,
				},
				{
					icon: 'fas fa-italic',
					action: () => this.editor?.chain().focus().toggleItalic().run(),
					isActive: () =>
						this.editor && this.editor.isActive
							? this.editor.isActive('italic')
							: false,
				},
				{
					icon: 'fas fa-link',
					action: () => {
						const url = window.prompt('Enter URL:');
						if (url && this.editor) {
							this.editor
								.chain()
								.focus()
								.setLink({ href: url, target: '_blank' })
								.run();
						}
					},
					isActive: () =>
						this.editor && this.editor.isActive ? this.editor.isActive('link') : false,
				},
			];
		},
	},
	data() {
		return {
			editor: null,
		};
	},
	methods: {
		isButtonActive(item) {
			return item.isActive ? item.isActive() : false;
		},
	},
	watch: {
		modelValue(value) {
			const isSame = this.editor.getHTML() === value;
			if (!isSame) {
				this.editor.commands.setContent(value, false);
			}
		},
	},
	mounted() {
		this.$nextTick(() => {
			this.editor = new Editor({
				extensions: [
					StarterKit,
					Link.configure({
						openOnClick: false,
						HTMLAttributes: {
							target: '_blank',
							rel: 'noopener noreferrer',
						},
					}),
				],
				content: this.modelValue,
				editable: !this.readOnly,
				onUpdate: () => {
					this.$emit('update:modelValue', this.editor.getHTML());
				},
			});
		});
	},
	beforeUnmount() {
		this.editor.destroy();
	},
};
</script>

<style lang="scss" scoped>
.rich-text-editor {
	border: 1px solid #dee2e6;
	border-radius: 4px;
	overflow: hidden;

	&.is-dark {
		border-color: #444;

		:deep(.ProseMirror) {
			background-color: #212529;
			color: #fff;
		}

		.editor-toolbar {
			background-color: #2c3034;
			border-bottom-color: #444;

			.toolbar-button {
				color: #fff;

				&:hover {
					background-color: #444;
				}

				&.is-active {
					background-color: #0d6efd;
				}
			}
		}
	}
}

.editor-toolbar {
	display: flex;
	padding: 0.5rem;
	background-color: #f8f9fa;
	border-bottom: 1px solid #dee2e6;
}

.toolbar-button {
	padding: 0.25rem 0.5rem;
	background: none;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	color: #212529;

	&:hover {
		background-color: #e9ecef;
	}

	&.is-active {
		background-color: #0d6efd;
		color: white;
	}
}

:deep(.ProseMirror) {
	padding: 1rem;
	min-height: 100px;
	outline: none;

	p {
		margin: 0 0 1em 0;

		&:last-child {
			margin-bottom: 0;
		}
	}

	a {
		color: #0d6efd;
		text-decoration: underline;
	}
}
</style>
