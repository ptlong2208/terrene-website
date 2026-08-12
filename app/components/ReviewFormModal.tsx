'use client';

import * as Form from '@radix-ui/react-form';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import Modal from '@/app/components/ui/Modal';
import PrimaryButton from '@/app/components/ui/PrimaryButton';
import StarRating from '@/app/components/ui/StarRating';
import type { ProductReview } from '@/lib/types';

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productSlug: string;
  productTitle: string;
  onSubmitted: (review: ProductReview) => void;
}

const FIELD_CLASS =
  'w-full border border-(--green-deep)/20 rounded-lg px-4 py-3 text-[14px] text-(--green-deep) bg-transparent placeholder:text-(--green-deep)/30 outline-none focus:border-(--green-deep)/60 transition-colors duration-200';

const LABEL_CLASS = 'text-[11px] font-bold tracking-[0.06em] text-(--green-deep)/70 uppercase';

interface DraftPhoto {
  file: File;
  previewUrl: string;
}

export default function ReviewFormModal({
  isOpen,
  onClose,
  productTitle,
  onSubmitted,
}: ReviewFormModalProps) {
  const t = useTranslations('reviews');
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setRating(0);
    setName('');
    setEmail('');
    setComment('');
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPhotos([]);
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setPhotos((prev) => [
      ...prev,
      ...acceptedFiles.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  });

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError(t('errorRatingRequired'));
      return;
    }
    setSubmitting(true);
    setError(null);

    // TEMP: chưa nối API thật (chờ Supabase) — mock ngay 1 review mới lên UI.
    // Revert: gọi POST /api/reviews với { productSlug, name, email, rating, comment, photos }.
    await new Promise((resolve) => setTimeout(resolve, 400));
    onSubmitted({
      id: crypto.randomUUID(),
      reviewerName: name,
      rating,
      comment,
      photos: photos.map((p) => p.previewUrl),
      createdAt: new Date().toISOString(),
    });

    setSubmitting(false);
    handleClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      ariaLabel={t('writeReview')}
      dialogClassName="scrollbar-thin w-full max-w-lg max-h-[85vh] overflow-y-auto p-[clamp(24px,3vw,40px)]"
    >
      <h3 className="mb-1 text-[18px] leading-snug font-semibold tracking-[-0.02em] text-(--green-deep)">
        {t('writeReview')}
      </h3>
      <p className="text-ink-soft mb-5 text-[13px]">
        {t('forProduct')} <b className="text-(--green-deep)">{productTitle}</b>
      </p>

      <Form.Root onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.75">
          <span className={LABEL_CLASS}>{t('rating')}</span>
          <StarRating value={rating} onChange={setRating} size={28} label={t('rating')} />
        </div>

        <Form.Field name="name" className="flex flex-col gap-1.75">
          <Form.Label className={LABEL_CLASS}>{t('yourName')}</Form.Label>
          <Form.Control asChild>
            <input
              type="text"
              required
              placeholder={t('yourNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={FIELD_CLASS}
            />
          </Form.Control>
        </Form.Field>

        <Form.Field name="email" className="flex flex-col gap-1.75">
          <Form.Label className={LABEL_CLASS}>{t('email')}</Form.Label>
          <Form.Control asChild>
            <input
              type="email"
              required
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={FIELD_CLASS}
            />
          </Form.Control>
        </Form.Field>

        <Form.Field name="comment" className="flex flex-col gap-1.75">
          <Form.Label className={LABEL_CLASS}>{t('comment')}</Form.Label>
          <Form.Control asChild>
            <textarea
              rows={4}
              required
              placeholder={t('commentPlaceholder')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={`${FIELD_CLASS} resize-none`}
            />
          </Form.Control>
        </Form.Field>

        <div className="flex flex-col gap-1.75">
          <span className={LABEL_CLASS}>{t('photos')}</span>
          <div
            {...getRootProps()}
            className={`text-ink-soft flex w-full cursor-pointer items-center justify-center gap-2 rounded border border-dashed px-3.5 py-4 text-center text-[12px] font-semibold tracking-[0.04em] uppercase transition-colors ${
              isDragActive
                ? 'border-(--green-deep) text-(--green-deep)'
                : 'border-line hover:border-(--green-deep)/50 hover:text-(--green-deep)'
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? t('dropPhotoHere') : `+ ${t('addPhoto')}`}
          </div>
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <div key={p.previewUrl} className="relative">
                  {/* unoptimized: local blob preview URL, not fetchable by Next's image proxy */}
                  <Image
                    src={p.previewUrl}
                    alt=""
                    width={60}
                    height={60}
                    unoptimized
                    className="h-15 w-15 rounded object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-(--green-deep) text-[11px] text-white"
                    aria-label={t('removePhoto')}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-[12px] text-red-500">{error}</p>}

        <PrimaryButton
          type="submit"
          disabled={submitting}
          loading={submitting}
          loadingText={t('submitting')}
          className="mt-1"
        >
          {t('submit')}
        </PrimaryButton>
      </Form.Root>
    </Modal>
  );
}
