import { useState, useRef } from "react";
import { useEditor } from "@/editor/use-editor";

interface UseFileUploadOptions {
	accept?: string;
	multiple?: boolean;
	onFilesSelected?: (files: File[]) => void | Promise<void>;
}

export function useFileUpload({
	accept,
	multiple,
	onFilesSelected,
}: UseFileUploadOptions = {}) {
	const editor = useEditor();
	const [isDragOver, setIsDragOver] = useState(false);
	const dragCounterRef = useRef(0);
	const inputRef = useRef<HTMLInputElement>(null);

	function containsFiles(dataTransfer: DataTransfer): boolean {
		return (
			!editor.timeline.dragSource.isActive() &&
			dataTransfer.types.includes("Files")
		);
	}

	function openFilePicker() {
		if (!inputRef.current) return;

		inputRef.current.accept = accept || "*";
		inputRef.current.multiple = multiple || false;
		inputRef.current.click();
	}

	async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const input = event.currentTarget;
		const files = Array.from(input.files ?? []);
		try {
			if (files.length > 0 && onFilesSelected) await onFilesSelected(files);
		} finally {
			// Keep the Photos selection alive until reading and saving have finished.
			input.value = "";
		}
	}

	function handleDragEnter(e: React.DragEvent) {
		e.preventDefault();

		if (!containsFiles(e.dataTransfer)) return;

		dragCounterRef.current += 1;
		setIsDragOver(true);
	}

	function handleDragOver(e: React.DragEvent) {
		e.preventDefault();

		if (!containsFiles(e.dataTransfer)) return;
	}

	function handleDragLeave(e: React.DragEvent) {
		e.preventDefault();

		if (!containsFiles(e.dataTransfer)) return;

		dragCounterRef.current -= 1;
		if (dragCounterRef.current === 0) {
			setIsDragOver(false);
		}
	}

	function handleDrop(e: React.DragEvent) {
		e.preventDefault();
		setIsDragOver(false);
		dragCounterRef.current = 0;

		if (onFilesSelected && containsFiles(e.dataTransfer)) {
			const files = Array.from(e.dataTransfer.files);
			const shouldUseMultiple = multiple ?? false;

			if (shouldUseMultiple) {
				onFilesSelected(files);
			} else if (files.length > 0) {
				onFilesSelected([files[0]]);
			}
		}
	}

	return {
		isDragOver,
		openFilePicker,
		fileInputProps: {
			accept,
			multiple,
			ref: inputRef,
			type: "file",
			style: { display: "none" },
			onChange: handleFileChange,
		},
		dragProps: {
			onDragEnter: handleDragEnter,
			onDragOver: handleDragOver,
			onDragLeave: handleDragLeave,
			onDrop: handleDrop,
		},
	};
}
