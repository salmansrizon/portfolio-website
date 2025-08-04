import { useState, useEffect, useRef } from 'react';

interface ContentEditorProps {
  initialContent?: string;
  onContentChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function ContentEditor({
  initialContent = '',
  onContentChange,
  placeholder = 'Write your content here...',
  className = '',
}: ContentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const editorRef = useRef<HTMLDivElement>(null);

  // Update content when initialContent changes
  useEffect(() => {
    if (editorRef.current && initialContent !== content) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    setContent(html);
    onContentChange(html);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  return (
    <div className={`border rounded-md ${className}`}>
      <div className="border-b p-2 flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="px-2 py-1 hover:bg-gray-100 rounded"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="px-2 py-1 hover:bg-gray-100 rounded"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => formatText('underline')}
          className="px-2 py-1 hover:bg-gray-100 rounded"
          title="Underline"
        >
          <u>U</u>
        </button>
        <div className="border-l border-gray-300 mx-1 h-6 self-center"></div>
        <select
          onChange={(e) => formatText('formatBlock', e.target.value)}
          className="px-2 py-1 border rounded text-sm"
          title="Text Format"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
        <div className="border-l border-gray-300 mx-1 h-6 self-center"></div>
        <button
          type="button"
          onClick={() => formatText('insertUnorderedList')}
          className="px-2 py-1 hover:bg-gray-100 rounded"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => formatText('insertOrderedList')}
          className="px-2 py-1 hover:bg-gray-100 rounded"
          title="Numbered List"
        >
          1. List
        </button>
      </div>
      <div
        ref={editorRef}
        className="min-h-[200px] p-4 outline-none"
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: initialContent }}
        data-placeholder={content ? '' : placeholder}
      />
    </div>
  );
}
