# ES1-T508: parse store-tests.yml, chạy đoạn dựng URL lhci với env giả, in danh sách URL.
# Dùng: ruby drafts/devops/ES1-T508/check-urls.rb .github/workflows/store-tests.yml
require 'yaml'
y = YAML.load_file(ARGV[0])
env = y['jobs']['lighthouse']['env']
abort 'thiếu BENCH_BLOG/BENCH_ARTICLE' unless env.key?('BENCH_BLOG') && env.key?('BENCH_ARTICLE')
puts "env: #{env.keys.join(',')}"
step = y['jobs']['lighthouse']['steps'].find { |s| s['name'] == 'Lighthouse desktop + mobile' }
build = step['run'].lines.take_while { |l| !l.start_with?('FAIL=0') }.join
base = { 'STORE_ORIGIN' => 'https://hoa-qua-nhap-khau.myshopify.com', 'THEME_ID' => '123',
         'BENCH_PRODUCT' => 'p', 'BENCH_COLLECTION' => 'c', 'BENCH_BLOG' => 'figma-blog' }
[['đủ', 'figma-stretch-after-training'], ['BENCH_ARTICLE rỗng', '']].each do |label, art|
  puts "--- #{label}"
  system(base.merge('BENCH_ARTICLE' => art), 'bash', '-c', build) or abort 'đoạn dựng URL lỗi'
end
